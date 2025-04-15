import assert from "node:assert/strict";
import test from "node:test";

import { ByteOrder } from "#byte-order.js";
import { CharUtf8Decoder } from "#datatypes/char/utf-8/decode.js";
import { Uint8Decoder, Uint16Decoder } from "#datatypes/int/decode.js";
import { stringDecoder } from "#datatypes/string/decode.js";
import { backreferencePattern } from "#patterns/backreference.js";
import { registerPatterns, MatchError } from "#patterns/match.js";
import { wildcardPattern } from "#patterns/wildcard.js";
import { ReadMode } from "#read-mode.js";

import { BinaryData, type UpdateBufferFunction } from "./binary-data.js";

function updateBuffer(source: Uint8Array): UpdateBufferFunction<Uint8Array> {
	return async ({ offset, byteLength, }) => source.subarray(offset, offset + byteLength);
}

test.describe("BinaryData", () => {
	test("hasNext", () => {
		const source = new Uint8Array(2);
		const data = new BinaryData(source.byteLength, updateBuffer(source));

		assert.equal(data.hasNext(), true);
		assert.equal(data.hasNext(1), true);
		assert.equal(data.hasNext(2), true);
		assert.equal(data.hasNext(3), false);

		assert.throws(() => data.hasNext(0));
	});

	test.describe("seek", () => {
		test("with updateBuffer", async () => {
			const source = new Uint8Array([ 0, 1, 2, 3, 4, ]);
			const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 2, });

			await data.seek(3);

			assert.equal(data.offset, 3);
			assert.equal(data.bufferStart, 3);
			assert.deepEqual(data.buffer, new Uint8Array([ 3, 4, ]));

			await data.seek(4);

			assert.equal(data.offset, 4);
			assert.equal(data.bufferStart, 3);
			assert.deepEqual(data.buffer, new Uint8Array([ 3, 4, ]));

			await data.seek(5);

			assert.equal(data.offset, 5);
			assert.equal(data.bufferStart, 5);
			assert.deepEqual(data.buffer, new Uint8Array([]));

			await data.seek(2);

			assert.equal(data.offset, 2);
			assert.equal(data.bufferStart, 2);
			assert.deepEqual(data.buffer, new Uint8Array([ 2, 3, ]));

			await data.seek(4);

			assert.equal(data.offset, 4);
			assert.equal(data.bufferStart, 4);
			assert.deepEqual(data.buffer, new Uint8Array([ 4, ]));

			await assert.rejects(data.seek(6));

			assert.equal(data.offset, 4);
			assert.equal(data.bufferStart, 4);
			assert.deepEqual(data.buffer, new Uint8Array([ 4, ]));
		});

		test("with direct source", async () => {
			const source = new Uint8Array([ 0, 1, 2, 3, 4, ]);
			const data = new BinaryData(source);

			await data.seek(3);

			assert.equal(data.offset, 3);
			assert.equal(data.bufferStart, 0);
			assert.deepEqual(data.buffer, source);

			await data.seek(4);

			assert.equal(data.offset, 4);
			assert.equal(data.bufferStart, 0);
			assert.deepEqual(data.buffer, source);

			await data.seek(5);

			assert.equal(data.offset, 5);
			assert.equal(data.bufferStart, 5);
			assert.deepEqual(data.buffer, new Uint8Array([]));

			await data.seek(2);

			assert.equal(data.offset, 2);
			assert.equal(data.bufferStart, 2);
			assert.deepEqual(data.buffer, new Uint8Array([ 2, 3, 4, ]));

			await data.seek(4);

			assert.equal(data.offset, 4);
			assert.equal(data.bufferStart, 2);
			assert.deepEqual(data.buffer, new Uint8Array([ 2, 3, 4, ]));

			await assert.rejects(data.seek(6));

			assert.equal(data.offset, 4);
			assert.equal(data.bufferStart, 2);
			assert.deepEqual(data.buffer, new Uint8Array([ 2, 3, 4, ]));
		});
	});

	test.todo("skip");
	test.todo("align");
	test.todo("slice");
	test.todo("readByteOrderMark");
	test.todo("assertMagic");

	test.describe("read", () => {
		test.todo("byteLength");

		test("utf-8 string buffer bounds", async () => {
			const textEncoder = new TextEncoder();
			// kana are 3 bytes each in UTF-8
			const source = textEncoder.encode("こんにちは\0世界");
			// test with a buffer size of 5 to make sure the 3 byte kana are still read correctly
			const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 5, });

			assert.deepEqual(await data.read(stringDecoder(CharUtf8Decoder), ReadMode.Source), {
				value: "こんにちは",
				source: textEncoder.encode("こんにちは\0"),
			});
		});
	});

	test("search", async () => {
		const source = new Uint8Array([ 0x00, 0x01, 0x00, 0x01, ]);
		const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 2, });

		const g = data.search([ 0x01, ]);

		let r = await g.next();

		assert(!r.done);
		assert.deepEqual(r.value, {
			offset: 0,
			matchByteLength: 0,
		});

		r = await g.next();

		assert(!r.done);
		assert.deepEqual(r.value, {
			offset: 1,
			matchByteLength: 1,
		});

		r = await g.next();

		assert(!r.done);
		assert.deepEqual(r.value, {
			offset: 2,
			matchByteLength: 0,
		});

		r = await g.next();

		assert(!r.done);
		assert.deepEqual(r.value, {
			offset: 3,
			matchByteLength: 1,
		});

		r = await g.next();

		assert(!r.done);
		assert.deepEqual(r.value, {
			offset: 4,
			matchByteLength: 0,
		});

		r = await g.next();

		assert(r.done);
	});

	test.describe("find", () => {
		test("empty source", async () => {
			const source = new Uint8Array(0);
			const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 2, });

			assert.equal(await data.find([ 0, ]), null);
			assert.equal(data.offset, 0);
		});

		test("numbers", async () => {
			const source = new Uint8Array([ 0x00, 0x01, 0x02, 0x03, 0x01, 0x02, ]);
			const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 2, });

			assert.equal(await data.find([ 0x01, 0x02, ]), 1);
			assert.equal(data.offset, 3);

			assert.equal(await data.find([ 0x05, ]), null);
			assert.equal(data.offset, 3);

			assert.equal(await data.find([ 0x01, 0x02, ]), 4);
			assert.equal(data.offset, 6);
		});

		test("patterns", async () => {
			registerPatterns([ wildcardPattern, backreferencePattern, ]);

			const source = new Uint8Array([ 0x00, 0x01, 0x02, 0x03, 0x01, 0x02, ]);
			const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 2, });

			assert.equal(await data.find([ "0?", "??", "02", ]), 0);
			assert.equal(data.offset, 3);

			assert.equal(await data.find([ "0?", "??", "02", ]), 3);
			assert.equal(data.offset, 6);

			assert.equal(await data.find([ "??", "$0+1", ], { offset: 0, }), 0);
			assert.equal(data.offset, 2);

			assert.equal(await data.find([ "??", "$0+1", ]), 2);
			assert.equal(data.offset, 4);

			assert.equal(await data.find([ "??", "$0+1", ], { offset: 3, }), 4);
			assert.equal(data.offset, 6);
		});

		test("data types", async () => {
			const source = new Uint8Array([ 0x20, 0x00, 0x00, 0x30, ]);
			const data = new BinaryData(source.byteLength, updateBuffer(source), ByteOrder.BigEndian, { bufferSize: 2, });

			assert.equal(await data.find([ async (read) => {
				const value = await read(Uint16Decoder);
				return value === 0x2000;
			}, ]), 0);

			assert.equal(data.offset, 2);

			assert.equal(await data.find([ async (read) => {
				const value = await read(Uint16Decoder);
				return value === 0x2000;
			}, ]), null);

			assert.equal(data.offset, 2);

			assert.equal(await data.find([ async (read) => {
				const value = await read(Uint16Decoder);
				return value === 0x30;
			}, ]), 2);

			assert.equal(data.offset, 4);
		});

		test("data types with backreference", async () => {
			const source = new Uint8Array([ 0x00, 0x01, ]);
			const data = new BinaryData(source.byteLength, updateBuffer(source), { bufferSize: 2, });

			const result = await data.find([
				async (read) => {
					const value = await read(Uint8Decoder);
					return value === 0x00;
				},
				async (read, backreferences) => {
					const reference = await backreferences.read(Uint8Decoder);
					const value = await read(Uint8Decoder);
					return value === reference + 1;
				},
			]);

			assert.equal(result, 0);
			assert.equal(data.offset, 2);
		});

		test("aborted signal", async () => {
			const data = new BinaryData(0, updateBuffer(new Uint8Array()), { bufferSize: 2, });

			await assert.rejects(data.find([], { signal: AbortSignal.abort(), }), (error) => {
				assert(error instanceof Error);
				assert.equal(error.name, "AbortError");
				return true;
			});
		});

		test("timeout", { timeout: 1000, }, async () => {
			const source = new Uint8Array([ 0, ]);
			const data = new BinaryData(Infinity, async () => source.subarray(0, 1), { bufferSize: 1, });

			await assert.rejects(data.find([ 1, ], { signal: AbortSignal.timeout(0), }), (error) => {
				assert(error instanceof Error);
				assert.equal(error.name, "TimeoutError");
				return true;
			});

			assert.equal(data.offset, 0);
		});

		test("invalid pattern", async () => {
			const source = new Uint8Array([ 0x00, 0x01, 0x02, ]);
			const data = new BinaryData(source.length, updateBuffer(source), { bufferSize: 1, });

			await assert.rejects(data.find([ 0x01, "xx", ]), (error) => error instanceof MatchError);
			assert.equal(data.offset, 0);
		});

		test("overshoot", async () => {
			const source = new Uint8Array([ 0x00, 0x01, ]);
			const data = new BinaryData(source.length, updateBuffer(source), { bufferSize: 1, });

			assert.equal(await data.find([ 0x01, 0x02, ]), null);
			assert.equal(data.offset, 0);
		});
	});
});
