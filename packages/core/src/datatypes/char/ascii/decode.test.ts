import assert from "node:assert/strict";
import { suite as group, test } from "node:test";

import { DecodeError } from "#datatypes/errors.ts";

import { CharAsciiDecoder } from "./decode.ts";

group("decode", () => {
	test("valid", () => {
		const buffer = new Uint8Array([ 0x00, 0x7f, ]);

		assert.deepEqual(
			CharAsciiDecoder.decode({ buffer, offset: 0, }),
			{ value: 0x00, source: new Uint8Array([ 0x00, ]), },
		);

		assert.deepEqual(
			CharAsciiDecoder.decode({ buffer, offset: 1, }),
			{ value: 0x7f, source: new Uint8Array([ 0x7f, ]), },
		);
	});

	test("invalid", () => {
		const buffer = new Uint8Array([ 0x80, ]);

		assert.throws(
			() => CharAsciiDecoder.decode({ buffer, offset: 0, }),
			new DecodeError("Invalid ASCII bytes", new Uint8Array([ 0x80, ])),
		);
	});
});


