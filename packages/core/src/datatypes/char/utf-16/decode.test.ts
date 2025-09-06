import assert from "node:assert/strict";
import { suite as group, test } from "node:test";

import { ByteOrder } from "#byte-order.ts";
import { DecodeError } from "#datatypes/errors.ts";

import { CharUtf16Decoder } from "./decode.ts";

group("decode", () => {
	test("valid", () => {
		const buffer = new Uint8Array([
			...[ 0xd7, 0xff, ],
			...[ 0xe0, 0x00, ],
			...[ 0xd8, 0x00, 0xdc, 0x00, ],
			...[ 0xdb, 0xff, 0xdf, 0xff, ],
		]);

		assert.deepEqual(
			CharUtf16Decoder.decode({ buffer, offset: 0, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0xd7ff, source: new Uint8Array([ 0xd7, 0xff, ]), },
		);

		assert.deepEqual(
			CharUtf16Decoder.decode({ buffer, offset: 2, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0xe000, source: new Uint8Array([ 0xe0, 0x00, ]), },
		);

		assert.deepEqual(
			CharUtf16Decoder.decode({ buffer, offset: 4, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0x10000, source: new Uint8Array([ 0xd8, 0x00, 0xdc, 0x00, ]), },
		);

		assert.deepEqual(
			CharUtf16Decoder.decode({ buffer, offset: 8, byteOrder: ByteOrder.BigEndian, }),
			{ value: 0x10ffff, source: new Uint8Array([ 0xdb, 0xff, 0xdf, 0xff, ]), },
		);
	});

	test("invalid", () => {
		const errorMessage = "Invalid UTF-16 bytes";

		assert.throws(
			() => CharUtf16Decoder.decode({ buffer: new Uint8Array([ 0xd8, 0x00, 0xd7, 0xff, ]), offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xd8, 0x00, 0xd7, 0xff, ])),
		);

		assert.throws(
			() => CharUtf16Decoder.decode({ buffer: new Uint8Array([ 0xdc, 0x00, 0xd7, 0xff, ]), offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xdc, 0x00, 0xd7, 0xff, ])),
		);

		assert.throws(
			() => CharUtf16Decoder.decode({ buffer: new Uint8Array([ 0xdc, 0x00, 0xd8, 0x00, ]), offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xdc, 0x00, 0xd8, 0x00, ])),
		);
	});
});
