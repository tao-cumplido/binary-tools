import assert from "node:assert/strict";
import test from "node:test";

import { DecodeError } from "#datatypes/errors.js";

import { CharUtf8Decoder } from "./decode.js";


test.describe("decode", () => {
	test("valid", () => {
		const buffer = new Uint8Array([
			...[ 0x7f, ],
			...[ 0xc2, 0x80, ],
			...[ 0xdf, 0xbf, ],
			...[ 0xe0, 0xa0, 0x80, ],
			...[ 0xed, 0x9f, 0xbf, ],
			...[ 0xee, 0x80, 0x80, ],
			...[ 0xef, 0xbf, 0xbf, ],
			...[ 0xf0, 0x90, 0x80, 0x80, ],
			...[ 0xf4, 0x8f, 0xbf, 0xbf, ],
		]);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 0, }),
			{ value: 0x7f, source: new Uint8Array([ 0x7f, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 1, }),
			{ value: 0x80, source: new Uint8Array([ 0xc2, 0x80, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 3, }),
			{ value: 0x07ff, source: new Uint8Array([ 0xdf, 0xbf, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 5, }),
			{ value: 0x0800, source: new Uint8Array([ 0xe0, 0xa0, 0x80, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 8, }),
			{ value: 0xd7ff, source: new Uint8Array([ 0xed, 0x9f, 0xbf, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 11, }),
			{ value: 0xe000, source: new Uint8Array([ 0xee, 0x80, 0x80, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 14, }),
			{ value: 0xffff, source: new Uint8Array([ 0xef, 0xbf, 0xbf, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 17, }),
			{ value: 0x010000, source: new Uint8Array([ 0xf0, 0x90, 0x80, 0x80, ]), },
		);

		assert.deepEqual(
			CharUtf8Decoder.decode({ buffer, offset: 21, }),
			{ value: 0x10ffff, source: new Uint8Array([ 0xf4, 0x8f, 0xbf, 0xbf, ]), },
		);
	});

	test("incomplete", () => {
		const errorMessage = "Incomplete UTF-8 bytes";

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer: new Uint8Array([ 0xc2, ]), offset: 0, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xc2, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer: new Uint8Array([ 0xe0, 0xa0, ]), offset: 0, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xe0, 0xa0, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer: new Uint8Array([ 0xf0, 0x90, 0x80, ]), offset: 0, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xf0, 0x90, 0x80, ])),
		);
	});

	test("invalid", () => {
		const errorMessage = "Invalid UTF-8 bytes";

		const buffer = new Uint8Array([
			...[ 0x80, ],
			...[ 0xbf, ],
			...[ 0xc0, ],
			...[ 0xc1, ],
			...[ 0xc2, 0x7f, ],
			...[ 0xc2, 0xc0, ],
			...[ 0xe0, 0x80, 0x80, ],
			...[ 0xe0, 0x9f, 0x80, ],
			...[ 0xed, 0xa0, 0x80, ],
			...[ 0xf0, 0x8f, 0x80, 0x80, ],
			...[ 0xf4, 0x90, 0x80, 0x80, ],
		]);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 0, }),
			new DecodeError(errorMessage, new Uint8Array([ 0x80, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 1, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xbf, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 2, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xc0, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 3, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xc1, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 4, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xc2, 0x7f, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 6, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xc2, 0xc0, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 8, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xe0, 0x80, 0x80, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 11, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xe0, 0x9f, 0x80, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 14, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xed, 0xa0, 0x80, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 17, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xf0, 0x8f, 0x80, 0x80, ])),
		);

		assert.throws(
			() => CharUtf8Decoder.decode({ buffer, offset: 21, }),
			new DecodeError(errorMessage, new Uint8Array([ 0xf4, 0x90, 0x80, 0x80, ])),
		);
	});
});
