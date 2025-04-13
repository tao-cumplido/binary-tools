import assert from "node:assert/strict";
import test from "node:test";

import { getFloat16, setFloat16 } from "@petamoriken/float16";

import { ByteOrder } from "#byte-order.js";

import { floatDecoder } from "./decode.js";

if (!DataView.prototype.getFloat16) {
	DataView.prototype.getFloat16 = function (byteOffset: number, littleEndian?: boolean) {
		return getFloat16(this, byteOffset, littleEndian);
	};
}

if (!DataView.prototype.setFloat16) {
	DataView.prototype.setFloat16 = function (byteOffset: number, value: number, littleEndian?: boolean) {
		return setFloat16(this, byteOffset, value, littleEndian);
	};
}

test.describe("decode", () => {
	test("half precision", () => {
		const view = new DataView(new ArrayBuffer(4));
		const buffer = new Uint8Array(view.buffer);

		view.setFloat16(0, 2 ** 15, true);
		view.setFloat16(2, 2 ** 15, false);

		const decoder = floatDecoder({ byteLength: 2, });

		assert.deepEqual(
			decoder.decode({ buffer, offset: 0, byteOrder: ByteOrder.LittleEndian, }),
			{ value: 2 ** 15, source: buffer.subarray(0, 2), },
		);

		assert.deepEqual(
			decoder.decode({ buffer, offset: 2, byteOrder: ByteOrder.BigEndian, }),
			{ value: 2 ** 15, source: buffer.subarray(2, 4), },
		);
	});

	test("single precision", () => {
		const view = new DataView(new ArrayBuffer(8));
		const buffer = new Uint8Array(view.buffer);

		view.setFloat32(0, 2 ** 127, true);
		view.setFloat32(4, 2 ** 127, false);

		const decoder = floatDecoder({ byteLength: 4, });

		assert.deepEqual(
			decoder.decode({ buffer, offset: 0, byteOrder: ByteOrder.LittleEndian, }),
			{ value: 2 ** 127, source: buffer.subarray(0, 4), },
		);

		assert.deepEqual(
			decoder.decode({ buffer, offset: 4, byteOrder: ByteOrder.BigEndian, }),
			{ value: 2 ** 127, source: buffer.subarray(4, 8), },
		);
	});

	test("double precision", () => {
		const view = new DataView(new ArrayBuffer(16));
		const buffer = new Uint8Array(view.buffer);

		view.setFloat64(0, 2 ** 1023, true);
		view.setFloat64(8, 2 ** 1023, false);

		const decoder = floatDecoder({ byteLength: 8, });

		assert.deepEqual(
			decoder.decode({ buffer, offset: 0, byteOrder: ByteOrder.LittleEndian, }),
			{ value: 2 ** 1023, source: buffer.subarray(0, 8), },
		);

		assert.deepEqual(
			decoder.decode({ buffer, offset: 8, byteOrder: ByteOrder.BigEndian, }),
			{ value: 2 ** 1023, source: buffer.subarray(8, 16), },
		);
	});

	test("incomplete buffer", () => {
		const buffer = new Uint8Array([ 0, ]);

		assert.throws(
			() => floatDecoder({ byteLength: 2, }).decode({ buffer, offset: 0, byteOrder: ByteOrder.BigEndian, }),
		);
	});
});
