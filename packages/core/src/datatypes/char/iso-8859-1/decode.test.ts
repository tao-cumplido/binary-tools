import assert from "node:assert/strict";
import { suite as group, test } from "node:test";

import { DecodeError } from "#datatypes/errors.ts";

import { CharIso8859_1Decoder } from "./decode.ts";

group("decode", () => {
	test("valid", () => {
		const buffer = new Uint8Array([ 0x20, 0x7e, 0xa0, 0xff, ]);

		assert.deepEqual(
			CharIso8859_1Decoder.decode({ buffer, offset: 0, }),
			{ value: 0x20, source: new Uint8Array([ 0x20, ]), },
		);

		assert.deepEqual(
			CharIso8859_1Decoder.decode({ buffer, offset: 1, }),
			{ value: 0x7e, source: new Uint8Array([ 0x7e, ]), },
		);

		assert.deepEqual(
			CharIso8859_1Decoder.decode({ buffer, offset: 2, }),
			{ value: 0xa0, source: new Uint8Array([ 0xa0, ]), },
		);

		assert.deepEqual(
			CharIso8859_1Decoder.decode({ buffer, offset: 3, }),
			{ value: 0xff, source: new Uint8Array([ 0xff, ]), },
		);
	});

	test("invalid", () => {
		const message = "Invalid ISO 8859-1 bytes";

		const buffer = new Uint8Array([ 0x00, 0x1f, 0x7f, 0x9f, ]);

		assert.throws(
			() => CharIso8859_1Decoder.decode({ buffer, offset: 0, }),
			new DecodeError(message, new Uint8Array([ 0x00, ])),
		);

		assert.throws(
			() => CharIso8859_1Decoder.decode({ buffer, offset: 1, }),
			new DecodeError(message, new Uint8Array([ 0x1f, ])),
		);

		assert.throws(
			() => CharIso8859_1Decoder.decode({ buffer, offset: 2, }),
			new DecodeError(message, new Uint8Array([ 0x7f, ])),
		);

		assert.throws(
			() => CharIso8859_1Decoder.decode({ buffer, offset: 3, }),
			new DecodeError(message, new Uint8Array([ 0x9f, ])),
		);
	});
});
