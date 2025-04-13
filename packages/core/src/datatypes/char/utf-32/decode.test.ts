import assert from "node:assert/strict";
import test from "node:test";

import { ByteOrder } from "#byte-order.js";
import { DecodeError } from "#datatypes/errors.js";

import { CharUtf32Decoder } from "./decode.js";

test.describe("decode", () => {
	test("valid", () => {
		const buffer = new Uint8Array([
			...[ 0x00, 0x00, 0xd7, 0xff, ],
			...[ 0x00, 0x00, 0xe0, 0x00, ],
			...[ 0x00, 0x10, 0xff, 0xff, ],
		]);

		assert.deepEqual(
			CharUtf32Decoder.decode({ buffer, offset: 0, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0xd7ff, source: new Uint8Array([ 0x00, 0x00, 0xd7, 0xff, ]), },
		);

		assert.deepEqual(
			CharUtf32Decoder.decode({ buffer, offset: 4, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0xe000, source: new Uint8Array([ 0x00, 0x00, 0xe0, 0x00, ]), },
		);

		assert.deepEqual(
			CharUtf32Decoder.decode({ buffer, offset: 8, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0x10ffff, source: new Uint8Array([ 0x00, 0x10, 0xff, 0xff, ]), },
		);
	});

	test("invalid", () => {
		const errorMessage = "Invalid UTF-32 code point";

		assert.throws(
			() => CharUtf32Decoder.decode({ buffer: new Uint8Array([ 0x00, 0x00, 0xd8, 0x00, ]), offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage, new Uint8Array([ 0x00, 0x00, 0xd8, 0x00, ])),
		);

		assert.throws(
			() => CharUtf32Decoder.decode({ buffer: new Uint8Array([ 0x00, 0x00, 0xdf, 0xff, ]), offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage, new Uint8Array([ 0x00, 0x00, 0xdf, 0xff, ])),
		);

		assert.throws(
			() => CharUtf32Decoder.decode({ buffer: new Uint8Array([ 0x00, 0x11, 0x00, 0x00, ]), offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage, new Uint8Array([ 0x00, 0x11, 0x00, 0x00, ])),
		);
	});
});
