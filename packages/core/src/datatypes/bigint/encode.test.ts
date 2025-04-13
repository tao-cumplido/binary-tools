import assert from "node:assert/strict";
import test from "node:test";

import { ByteOrder } from "#byte-order.js";
import { EncodeError } from "#datatypes/errors.js";

import { bigintEncoder } from "./encode.js";

test.describe("encode", () => {
	test("big endian", () => {
		const write = (byteLength: number, value: bigint) => {
			return bigintEncoder({ byteLength, }).encode(value, ByteOrder.BigEndian);
		};

		assert.deepEqual(
			write(1, 0x12n),
			new Uint8Array([ 0x12, ]),
		);
		assert.deepEqual(
			write(2, 0x12n),
			new Uint8Array([ 0x00, 0x12, ]),
		);

		assert.deepEqual(
			write(8, 0x12_34_56_78_9a_bc_de_f0n),
			new Uint8Array([ 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, ]),
		);

		assert.deepEqual(
			write(15, 0x12_34_56_78_9a_bc_de_ff_ed_cb_a9_87_65_43_21n),
			new Uint8Array([ 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xff, 0xed, 0xcb, 0xa9, 0x87, 0x65, 0x43, 0x21, ]),
		);

		assert.deepEqual(
			write(1, -0x10n),
			new Uint8Array([ 0xf0, ]),
		);

		assert.deepEqual(
			write(2, -0x10n),
			new Uint8Array([ 0xff, 0xf0, ]),
		);
	});

	test("little endian", () => {
		const write = (byteLength: number, value: bigint) => {
			return bigintEncoder({ byteLength, }).encode(value, ByteOrder.LittleEndian);
		};

		assert.deepEqual(
			write(1, 0x12n),
			new Uint8Array([ 0x12, ]),
		);

		assert.deepEqual(
			write(2, 0x12n),
			new Uint8Array([ 0x12, 0x00, ]),
		);

		assert.deepEqual(
			write(8, 0x12_34_56_78_9a_bc_de_f0n),
			new Uint8Array([ 0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12, ]),
		);

		assert.deepEqual(
			write(15, 0x12_34_56_78_9a_bc_de_ff_ed_cb_a9_87_65_43_21n),
			new Uint8Array([ 0x21, 0x43, 0x65, 0x87, 0xa9, 0xcb, 0xed, 0xff, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12, ]),
		);
	});

	test("byte order precedence", () => {
		const { encode, } = bigintEncoder({ byteLength: 2, }, ByteOrder.LittleEndian);

		assert.deepEqual(
			encode(0x100n, ByteOrder.BigEndian),
			new Uint8Array([ 0x00, 0x01, ]),
		);
	});

	test("no byte order", () => {
		assert.deepEqual(
			bigintEncoder({ byteLength: 1, }).encode(0n, undefined),
			new Uint8Array([ 0x00, ]),
		);

		assert.throws(
			() => bigintEncoder({ byteLength: 2, }).encode(0n, undefined),
			(error) => error instanceof EncodeError,
		);
	});
});
