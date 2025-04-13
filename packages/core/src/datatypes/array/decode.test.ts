import assert from "node:assert/strict";
import test from "node:test";

import type { DecoderFunction } from "#datatypes/decoder.js";
import { asyncBuffer } from "#datatypes/util.test.js";

import { arrayDecoder } from "./decode.js";

const Uint8: DecoderFunction<number | undefined> = ({ buffer, offset, }) => {
	return {
		source: buffer.subarray(offset, offset + 1),
		value: buffer[offset],
	};
};

test.describe("decode", () => {
	test("single byte", async () => {
		const buffer = new Uint8Array([ 0, 1, 2, 3, ]);
		const decoder = arrayDecoder(Uint8, 2);
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: [ 0, 1, ],
			source: new Uint8Array([ 0, 1, ]),
		});

		assert.deepEqual(await decoder.decode(seek(2), queryState), {
			value: [ 2, 3, ],
			source: new Uint8Array([ 2, 3, ]),
		});

		await assert.rejects(decoder.decode(seek(3), queryState));
	});

	test("nested array", async () => {
		const buffer = new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, ]);
		const decoder = arrayDecoder(arrayDecoder(Uint8, 2), 3);
		const { seek, queryState, } = asyncBuffer(buffer, 3);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: [ [ 0, 1, ], [ 2, 3, ], [ 4, 5, ], ],
			source: new Uint8Array([ 0, 1, 2, 3, 4, 5, ]),
		});

		assert.deepEqual(await decoder.decode(seek(1), queryState), {
			value: [ [ 1, 2, ], [ 3, 4, ], [ 5, 6, ], ],
			source: new Uint8Array([ 1, 2, 3, 4, 5, 6, ]),
		});

		await assert.rejects(decoder.decode(seek(2), queryState));
	});
});
