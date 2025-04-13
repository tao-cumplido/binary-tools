import assert from "node:assert/strict";
import test from "node:test";

import type { DecoderObject } from "#datatypes/decoder.js";
import { asyncBuffer } from "#datatypes/util.test.js";

import { stringDecoderFixedByteLength, stringDecoderFixedCount, stringDecoderTerminated } from "./decode.js";

const Char8: DecoderObject<number> = {
	requiredBufferSize: 1,
	decode: ({ buffer, offset, }) => {
		const value = offset >= buffer.byteLength ? -1 : buffer[offset]!;

		return {
			value,
			source: buffer.subarray(offset, offset + 1),
		};
	},
};

const Char16: DecoderObject<number> = {
	requiredBufferSize: 2,
	decode: ({ buffer, offset, }) => {
		const value = offset + 1 >= buffer.byteLength ? -1 : (buffer[offset]! << 8) + buffer[offset + 1]!;

		return {
			value,
			source: buffer.subarray(offset, offset + 2),
		};
	},
};

test.describe("async", () => {
	test("fixed char count", async () => {
		const buffer = new Uint8Array([ 0x61, 0x62, 0x63, ]);
		const decoder = stringDecoderFixedCount(Char8, 2);
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: "ab",
			source: new Uint8Array([ 0x61, 0x62, ]),
		});

		assert.deepEqual(await decoder.decode(seek(1), queryState), {
			value: "bc",
			source: new Uint8Array([ 0x62, 0x63, ]),
		});

		await assert.rejects(decoder.decode(seek(2), queryState));
	});

	test("fixed byteLength 8bit", async () => {
		const buffer = new Uint8Array([ 0x61, 0x62, 0x63, 0x64, ]);
		const decoder = stringDecoderFixedByteLength(Char8, 2);
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: "ab",
			source: new Uint8Array([ 0x61, 0x62, ]),
		});

		assert.deepEqual(await decoder.decode(seek(2), queryState), {
			value: "cd",
			source: new Uint8Array([ 0x63, 0x64, ]),
		});

		await assert.rejects(decoder.decode(seek(3), queryState));
	});

	test("fixed byteLength 16bit valid", async () => {
		const buffer = new Uint8Array([ 0x30, 0x42, 0x30, 0x44, ]);
		const decoder = stringDecoderFixedByteLength(Char16, 2);
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: "あ",
			source: new Uint8Array([ 0x30, 0x42, ]),
		});

		assert.deepEqual(await decoder.decode(seek(2), queryState), {
			value: "い",
			source: new Uint8Array([ 0x30, 0x44, ]),
		});
	});

	test("fixed byteLength 16bit invalid", async () => {
		const buffer = new Uint8Array([ 0x30, 0x42, 0x30, 0x44, ]);
		const decoder = stringDecoderFixedByteLength(Char16, 3);
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		await assert.rejects(decoder.decode(seek(0), queryState));
	});

	test("terminated", async () => {
		const buffer = new Uint8Array([ 0x31, 0x32, 0x33, 0x00, 0x61, 0x62, ]);
		const decoder = stringDecoderTerminated(Char8, "3");
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: "12",
			source: new Uint8Array([ 0x31, 0x32, 0x33, ]),
		});

		assert.deepEqual(await decoder.decode(seek(3), queryState), {
			value: "\0ab",
			source: new Uint8Array([ 0x00, 0x61, 0x62, ]),
		});

		await assert.rejects(decoder.decode(seek(6), queryState));
	});
});
