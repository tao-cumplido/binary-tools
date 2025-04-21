import type { Simplify } from "type-fest";
import { match, P } from "ts-pattern";

import { assertInt } from "#assert.js";
import { ByteOrder } from "#byte-order.js";
import { bytesDecoder } from "#datatypes/bytes/decode.js";
import { CharAsciiDecoder } from "#datatypes/char/ascii/decode.js";
import { getDecoderObject, type Decoder, type DecoderResult } from "#datatypes/decoder.js";
import { intDecoder, Uint8Decoder } from "#datatypes/int/decode.js";
import { stringDecoderFixedCount } from "#datatypes/string/decode.js";
import { hexByte } from "#format.js";
import { matchPattern } from "#patterns/match.js";
import { ReadMode } from "#read-mode.js";

export type UpdateBufferState = {
	readonly offset: number;
	readonly byteLength: number;
};

export type UpdateBufferFunction<Buffer extends Uint8Array> = (state: UpdateBufferState) => Promise<Buffer>;

export type BinaryDataConfig = {
	readonly bufferSize: number;
};

export type SeekOptions = {
	readonly offset?: undefined | number;
};

type SearchItemFunction = (read: BinaryData["read"], backreferences: BinaryData) => Promise<boolean>;
type ValidatedSearchItem = (backreferences: BinaryData) => Promise<boolean>;

export type SearchItem = number | string | SearchItemFunction;

export type SearchProgress = {
	readonly offset: number;
	readonly matchByteLength: number;
};

export type FindOptions = Simplify<SeekOptions & {
	readonly microTaskByteLength?: undefined | number;
	readonly signal?: undefined | {
		readonly aborted: boolean;
		readonly reason: unknown;
		throwIfAborted(): void;
	};
}>;

// we declare setTimeout here as it is the only global required
// this lib intends to be platform agnostic and doesn't include any global types otherwise
// unfortunately it's not possible to just include specific definitions from TS's DOM lib or @types/node
declare var setTimeout: (callback: (...args: unknown[]) => unknown, delay?: number) => void;

export class BinaryData<Buffer extends Uint8Array = Uint8Array> {
	#byteLength: number;
	#updateBuffer: UpdateBufferFunction<Buffer>;
	#buffer: Buffer | undefined;
	#offset: number;
	#bufferStart: number;
	#bufferSize: number;

	byteOrder: ByteOrder | undefined;

	get buffer(): Buffer {
		if (!this.#buffer) {
			throw new ReferenceError("The buffer hasn't been initialized yet. Any of the asynchronous methods can be used to do so, e.g. `await seek(0)`");
		}

		return this.#buffer;
	}

	get byteLength(): number {
		return this.#byteLength;
	}

	get offset(): number {
		return this.#offset;
	}

	get bufferStart(): number {
		return this.#bufferStart;
	}

	constructor(byteLength: number, updateBuffer: UpdateBufferFunction<Buffer>, config: BinaryDataConfig);
	constructor(byteLength: number, updateBuffer: UpdateBufferFunction<Buffer>, byteOrder?: ByteOrder, config?: BinaryDataConfig);
	constructor(source: Buffer, byteOrder?: ByteOrder);
	constructor(byteLengthOrSource: number | Buffer, updateBufferOrByteOrder?: UpdateBufferFunction<Buffer> | ByteOrder, byteOrderOrConfig?: ByteOrder | BinaryDataConfig, { bufferSize = 2 ** 20 * 10, } = {}) {
		this.#offset = 0;
		this.#bufferStart = 0;

		if (typeof byteLengthOrSource === "number") {
			this.#byteLength = byteLengthOrSource;
			this.#updateBuffer = updateBufferOrByteOrder as UpdateBufferFunction<Buffer>;
			if (byteOrderOrConfig instanceof ByteOrder) {
				this.byteOrder = byteOrderOrConfig;
				this.#bufferSize = bufferSize;
			} else {
				this.#bufferSize = Math.min(byteOrderOrConfig?.bufferSize ?? bufferSize, this.#byteLength);
			}
		} else {
			this.#byteLength = byteLengthOrSource.byteLength;
			this.byteOrder = updateBufferOrByteOrder as ByteOrder;
			this.#bufferSize = this.#byteLength;
			this.#buffer = byteLengthOrSource;
			this.#updateBuffer = async ({ offset, }) => byteLengthOrSource.subarray(offset, this.#byteLength) as Buffer;
		}
	}

	async #getBuffer() {
		if (!this.#buffer) {
			this.#buffer = await this.#updateBuffer({ offset: 0, byteLength: this.#bufferSize, });
		}

		return this.#buffer;
	}

	async #checkBufferBounds(delta: number, requiredByteLength = 0) {
		const buffer = await this.#getBuffer();

		const bufferOffset = this.#offset - this.#bufferStart;
		const offset = this.#offset + delta;

		if (bufferOffset + delta < 0 || bufferOffset + delta + requiredByteLength >= buffer.byteLength) {
			this.#buffer = await this.#updateBuffer({ offset, byteLength: this.#bufferSize, });
			this.#bufferStart = offset;
		}

		this.#offset = offset;
	}

	hasNext(byteLength = 1): boolean {
		assertInt(byteLength, { min: 1, });
		return this.#offset + byteLength <= this.#byteLength;
	}

	async seek(offset: number): Promise<void> {
		assertInt(offset, { min: 0, max: this.#byteLength, });
		await this.#checkBufferBounds(offset - this.#offset);
	}

	async skip(byteLength: number): Promise<void> {
		await this.seek(this.#offset + byteLength);
	}

	async align(to: number): Promise<void> {
		await this.skip(((-this.#offset % to) + to) % to);
	}

	async slice(byteLength: number, { offset = this.#offset, }: SeekOptions = {}): Promise<BinaryData<Buffer>> {
		await this.seek(offset + byteLength);
		return new BinaryData(
			byteLength,
			(state) => this.#updateBuffer({ offset: offset + state.offset, byteLength: state.byteLength, }),
			this.byteOrder,
			{ bufferSize: this.#bufferSize, },
		);
	}

	async readByteOrderMark({ offset = this.#offset, }: SeekOptions = {}): Promise<void> {
		await this.seek(offset);

		const key = await this.read(intDecoder({ signed: false, byteLength: 2, }, ByteOrder.BigEndian));
		this.byteOrder = ByteOrder.lookupKey(key);

		if (!this.byteOrder) {
			throw new TypeError(`Invalid byte order mark: ${key.toString(16)}`);
		}
	}

	async assertMagic(magic: string | Uint8Array, { offset = this.#offset, }: SeekOptions = {}): Promise<void> {
		await this.seek(offset);

		if (typeof magic === "string") {
			const value = await this.read(stringDecoderFixedCount(CharAsciiDecoder, magic.length));

			if (magic !== value) {
				throw new TypeError(`Invalid magic: expected '${magic}', got '${value}'`);
			}

			return;
		}

		const value = await this.read(magic.length);

		for (let i = 0; i < value.length; i++) {
			if (value[i] !== magic[i]) {
				throw new TypeError(`Invalid magic: expected ${hexByte(magic[i])} at position ${i}, got ${hexByte(value[i])}`);
			}
		}
	}

	async #queryState(advanceBytes: number, bufferSize?: number) {
		await this.#checkBufferBounds(advanceBytes, bufferSize);

		return {
			buffer: await this.#getBuffer(),
			offset: this.#offset - this.#bufferStart,
		};
	}

	read(byteLength: number): Promise<Uint8Array>;
	read<Value>(type: Decoder<Value>, mode: typeof ReadMode.Source): Promise<DecoderResult<Value>>;
	read<Value>(type: Decoder<Value>, mode?: typeof ReadMode.Value): Promise<Value>;
	async read<Value>(type: number | Decoder<Value>, mode: ReadMode = ReadMode.Value): Promise<Uint8Array | Value | DecoderResult<Value>> {
		if (typeof type === "number") {
			return this.read(bytesDecoder(type));
		}

		const { decode, requiredBufferSize, } = getDecoderObject(type);

		if (requiredBufferSize > this.#bufferSize) {
			throw new Error(`Given decoders requires a buffer size of ${requiredBufferSize} but this instance's buffer size is ${this.#bufferSize}.`);
		}

		await this.#checkBufferBounds(0, requiredBufferSize);

		const initialOffset = this.#offset;

		try {
			const result = await decode({
				buffer: await this.#getBuffer(),
				offset: this.#offset - this.#bufferStart,
				byteOrder: this.byteOrder,
			}, this.#queryState.bind(this));

			await this.seek(initialOffset + result.source.byteLength);

			if (mode === ReadMode.Source) {
				return result;
			}

			return result.value;
		} catch (error) {
			await this.seek(initialOffset);
			throw error;
		}
	}

	#validateSearchSequence(sequence: readonly SearchItem[], temp: BinaryData): readonly ValidatedSearchItem[] {
		return sequence.map((item) => match(item)
			.returnType<ValidatedSearchItem>()
			.with(P.number, (byte) => {
				return async () => temp.hasNext() && (await temp.read(Uint8Decoder) === byte);
			})
			.with(P.string, (pattern) => {
				const validate = matchPattern(pattern);
				return async (backreferences) => temp.hasNext() && validate(await temp.read(Uint8Decoder), await backreferences.#getBuffer());
			})
			.otherwise((validate) => {
				return async (backreferences) => {
					try {
						return await validate(temp.read.bind(temp), backreferences);
					} catch {
						return false;
					}
				};
			}),
		);
	}

	async *search(sequence: readonly SearchItem[], { offset = this.#offset, microTaskByteLength = 100, signal, }: FindOptions = {}): AsyncGenerator<SearchProgress, void> {
		assertInt(microTaskByteLength, { min: 1, });

		signal?.throwIfAborted();

		const temp = new BinaryData(this.#byteLength, this.#updateBuffer, this.byteOrder, { bufferSize: this.#bufferSize, });
		const validatedSequence = this.#validateSearchSequence(sequence, temp);

		progress: for (let searchOffset = offset; searchOffset <= temp.#byteLength; searchOffset++) {
			if ((searchOffset - offset) % microTaskByteLength === 0) {
				await new Promise((resolve) => setTimeout(resolve));
			}

			await temp.seek(searchOffset);

			if (signal?.aborted || !temp.hasNext()) {
				signal?.throwIfAborted();
				yield { offset: temp.#offset, matchByteLength: 0, };
				return;
			}

			for (const checkNext of validatedSequence) {
				const currentOffset = temp.#offset;
				const backreferences = await temp.slice(currentOffset - searchOffset, { offset: searchOffset, });
				await temp.seek(currentOffset);

				if (!(await checkNext(backreferences))) {
					yield { offset: searchOffset, matchByteLength: 0, };
					continue progress;
				}
			}

			yield {
				offset: searchOffset,
				matchByteLength: temp.#offset - searchOffset,
			};
		}
	}

	async find(sequence: readonly SearchItem[], options?: FindOptions): Promise<number | null> {
		for await (const { offset, matchByteLength, } of this.search(sequence, options)) {
			if (matchByteLength) {
				await this.seek(offset + matchByteLength);
				return offset;
			}
		}

		return null;
	}
}
