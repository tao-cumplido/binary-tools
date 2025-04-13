import assert from "node:assert/strict";
import test from "node:test";

import { asyncBuffer } from "#datatypes/util.test.js";

import { bytesDecoder } from "./decode.js";

test.describe("decode", () => {
	test("boundaries", async () => {
		const buffer = new Uint8Array([ 0, 1, 2, 3, 4, 5, ]);
		const decoder = bytesDecoder(5);
		const { seek, queryState, } = asyncBuffer(buffer, 2);

		assert.deepEqual(await decoder.decode(seek(0), queryState), {
			value: new Uint8Array([ 0, 1, 2, 3, 4, ]),
			source: new Uint8Array([ 0, 1, 2, 3, 4, ]),
		});
	});
});
