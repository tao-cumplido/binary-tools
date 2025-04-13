import assert from "node:assert/strict";
import test from "node:test";

import { ByteOrder } from "#byte-order.js";
import { DecodeError } from "#datatypes/errors.js";

import { bigintDecoder, errorMessage } from "./decode.js";

test.describe("decode", () => {
	test("uint big endian", () => {
		const buffer = new Uint8Array([
			0x12,
			0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
			0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xff, 0xed, 0xcb, 0xa9, 0x87, 0x65, 0x43, 0x21,
		]);

		const read = (offset: number, byteLength: number) => {
			return bigintDecoder({ signed: false, byteLength, }).decode({ buffer, offset, byteOrder: ByteOrder.BigEndian, });
		};

		assert.deepEqual(read(0, 1), {
			value: 0x12n,
			source: buffer.subarray(0, 1),
		});

		assert.deepEqual(read(1, 8), {
			value: 0x12_34_56_78_9a_bc_de_f0n,
			source: buffer.subarray(1, 9),
		});

		assert.deepEqual(read(9, 15), {
			value: 0x12_34_56_78_9a_bc_de_ff_ed_cb_a9_87_65_43_21n,
			source: buffer.subarray(9, 24),
		});
	});

	test("uint little endian", () => {
		const buffer = new Uint8Array([
			0x12,
			0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12,
			0x21, 0x43, 0x65, 0x87, 0xa9, 0xcb, 0xed, 0xff, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12,
		]);

		const read = (offset: number, byteLength: number) => {
			return bigintDecoder({ signed: false, byteLength, }).decode({ buffer, offset, byteOrder: ByteOrder.LittleEndian, });
		};

		assert.deepEqual(read(0, 1), {
			value: 0x12n,
			source: buffer.subarray(0, 1),
		});

		assert.deepEqual(read(1, 8), {
			value: 0x12_34_56_78_9a_bc_de_f0n,
			source: buffer.subarray(1, 9),
		});

		assert.deepEqual(read(9, 15), {
			value: 0x12_34_56_78_9a_bc_de_ff_ed_cb_a9_87_65_43_21n,
			source: buffer.subarray(9, 24),
		});
	});

	test("int big endian", () => {
		const buffer = new Uint8Array([
			0xf0,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xf0,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xf0,
		]);

		const read = (offset: number, byteLength: number) => {
			return bigintDecoder({ signed: true, byteLength, }).decode({ buffer, offset, byteOrder: ByteOrder.BigEndian, });
		};

		assert.deepEqual(read(0, 1), {
			value: -0x10n,
			source: buffer.subarray(0, 1),
		});

		assert.deepEqual(read(1, 8), {
			value: -0x10n,
			source: buffer.subarray(1, 9),
		});

		assert.deepEqual(read(9, 15), {
			value: -0x10n,
			source: buffer.subarray(9, 24),
		});
	});

	test("int little endian", () => {
		const buffer = new Uint8Array([
			0xf0,
			0xf0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xf0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		]);

		const read = (offset: number, byteLength: number) => {
			return bigintDecoder({ signed: true, byteLength, }).decode({ buffer, offset, byteOrder: ByteOrder.LittleEndian, });
		};

		assert.deepEqual(read(0, 1), {
			value: -0x10n,
			source: buffer.subarray(0, 1),
		});

		assert.deepEqual(read(1, 8), {
			value: -0x10n,
			source: buffer.subarray(1, 9),
		});

		assert.deepEqual(read(9, 15), {
			value: -0x10n,
			source: buffer.subarray(9, 24),
		});
	});

	test("mixed endianness", () => {
		const buffer = new Uint8Array([ 0x12, 0x34, 0x56, 0x78, ]);

		const { decode, } = bigintDecoder({ signed: false, byteLength: 2, });

		assert.deepEqual(decode({ buffer, offset: 0, byteOrder: ByteOrder.BigEndian, }), {
			value: 0x1234n,
			source: buffer.subarray(0, 2),
		});

		assert.deepEqual(decode({ buffer, offset: 2, byteOrder: ByteOrder.LittleEndian, }), {
			value: 0x7856n,
			source: buffer.subarray(2, 4),
		});
	});

	test("byte order precedence", () => {
		const buffer = new Uint8Array([ 0x00, 0x01, ]);

		const { decode, } = bigintDecoder({ signed: false, byteLength: 2, }, ByteOrder.LittleEndian);

		assert.deepEqual(decode({ buffer, offset: 0, byteOrder: ByteOrder.BigEndian, }), {
			value: 0x100n,
			source: buffer.subarray(),
		});
	});

	test("no byte order", () => {
		const buffer = new Uint8Array([ 0, 0, ]);

		assert.deepEqual(bigintDecoder({ signed: false, byteLength: 1, }).decode({ buffer, offset: 0, }), {
			value: 0n,
			source: buffer.subarray(0, 1),
		});

		assert.throws(
			() => bigintDecoder({ signed: false, byteLength: 2, }).decode({ buffer, offset: 0, }),
			new DecodeError(errorMessage.noByteOrder(2), buffer.subarray()),
		);
	});

	test("incomplete buffer", () => {
		const buffer = new Uint8Array([ 0, ]);

		assert.throws(
			() => bigintDecoder({ signed: false, byteLength: 2, }).decode({ buffer, offset: 0, byteOrder: ByteOrder.BigEndian, }),
			new DecodeError(errorMessage.unexpectedBufferEnd(2, 0), buffer.subarray()),
		);
	});
});
