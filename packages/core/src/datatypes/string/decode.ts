import { match, P } from "ts-pattern";

import type { ByteOrder } from "#byte-order.js";
import { assertInt } from "#assert.js";
import { arrayDecoder } from "#datatypes/array/decode.js";
import { getDecoderObject, validateResult, type Decoder, type DecoderObject, type DecoderResult } from "#datatypes/decoder.js";
import { DecodeError } from "#datatypes/errors.js";

class StringResult {
	#sources: Uint8Array[] = [];
	#byteLength = 0;
	#value = "";

	get byteLength() {
		return this.#byteLength;
	}

	append(char: string, source: Uint8Array): void {
		this.#sources.push(source);
		this.#byteLength += source.byteLength;
		this.#value += char;
	}

	combine(): DecoderResult<string> {
		const source = new Uint8Array(this.#byteLength);

		let offset = 0;

		for (const part of this.#sources) {
			source.set(part, offset);
			offset += part.byteLength;
		}

		return {
			source,
			value: this.#value,
		};
	}
}

export const stringDecoderFixedCount = (char: Decoder<number>, count: number, overrideByteOrder?: ByteOrder) => {
	const array = arrayDecoder(char, count, overrideByteOrder);

	return {
		requiredBufferSize: array.requiredBufferSize,
		decode: async (state, queryState) => {
			const { value, source, } = await array.decode(state, queryState);
			return {
				value: value.map((code) => String.fromCodePoint(code)).join(""),
				source,
			};
		},
	} as const satisfies DecoderObject<string>;
};

export const stringDecoderFixedByteLength = (char: Decoder<number>, byteLength: number, overrideByteOrder?: ByteOrder) => {
	assertInt(byteLength, { min: 1, });

	const { decode: decodeChar, requiredBufferSize, } = getDecoderObject(char);

	return {
		requiredBufferSize,
		decode: async ({ buffer, offset, byteOrder, }, queryState) => {
			const result = new StringResult();

			byteOrder = overrideByteOrder ?? byteOrder;

			while (result.byteLength < byteLength) {
				const { value, source, } = validateResult(await decodeChar({ buffer, offset, byteOrder, }, queryState));
				result.append(String.fromCodePoint(value), source);
				({ buffer, offset, } = await queryState(source.byteLength, requiredBufferSize));
			}

			if (result.byteLength !== byteLength) {
				throw new DecodeError(`Couldn't decode exactly ${byteLength} bytes with given encoding.`);
			}

			return result.combine();
		},
	} as const satisfies DecoderObject<string>;
};

export const stringDecoderTerminated = (char: Decoder<number>, terminator = "\0", overrideByteOrder?: ByteOrder) => {
	assertInt(terminator.length, { min: 1, });

	const { decode: decodeChar, requiredBufferSize, } = getDecoderObject(char);

	return {
		requiredBufferSize,
		decode: async ({ buffer, offset, byteOrder, }, queryState) => {
			const result = new StringResult();

			byteOrder = overrideByteOrder ?? byteOrder;

			let { value, source, } = validateResult(await decodeChar({ buffer, offset, byteOrder, }, queryState));
			let charValue = String.fromCodePoint(value);

			({ buffer, offset, } = await queryState(source.byteLength, requiredBufferSize));


			while (charValue !== terminator && offset < buffer.byteLength) {
				result.append(charValue, source);
				({ value, source, } = validateResult(await decodeChar({ buffer, offset, byteOrder, }, queryState)));
				charValue = String.fromCodePoint(value);
				({ buffer, offset, } = await queryState(source.byteLength, requiredBufferSize));
			}

			if (charValue !== terminator) {
				result.append(charValue, source);
			} else {
				result.append("", source);
			}

			return result.combine();
		},
	} as const satisfies DecoderObject<string>;
};

export type StringOptions = {
	readonly count: number;
	readonly byteLength: number;
	readonly terminator?: string;
};

export type StringDecoderFactory = {
	(char: Decoder<number>, options: Pick<StringOptions, "count">, byteOrder?: ByteOrder): DecoderObject<string>;
	(char: Decoder<number>, options: Pick<StringOptions, "byteLength">, byteOrder?: ByteOrder): DecoderObject<string>;
	(char: Decoder<number>, options?: Pick<StringOptions, "terminator">, byteOrder?: ByteOrder): DecoderObject<string>;
};

export const stringDecoder: StringDecoderFactory = (char, options, byteOrder) => {
	return match(options ?? {})
		.with({ count: P.number, }, ({ count, }) => stringDecoderFixedCount(char, count, byteOrder))
		.with({ byteLength: P.number, }, ({ byteLength, }) => stringDecoderFixedByteLength(char, byteLength, byteOrder))
		.otherwise(({ terminator, }) => stringDecoderTerminated(char, terminator, byteOrder));
};
