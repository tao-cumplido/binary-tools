import type { EncoderObject } from "#datatypes/encoder.js";
import { EncodeError } from "#datatypes/errors.js";

import { isInvalidUnicodeCodePoint } from "../util.js";

export const CharUtf8Encoder = {
	encode: (code) => {
		if (isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid Unicode code point`, code);
		}

		if (code < 0x80) {
			return new Uint8Array([ code, ]);
		}

		if (code < 0x800) {
			return new Uint8Array([
				code >> 6 & 0x1f | 0xc0,
				code & 0x3f | 0x80,
			]);
		}

		if (code < 0x10000) {
			return new Uint8Array([
				code >> 12 & 0x0f | 0xe0,
				code >> 6 & 0x3f | 0x80,
				code & 0x3f | 0x80,
			]);
		}

		return new Uint8Array([
			code >> 18 & 0x07 | 0xf0,
			code >> 12 & 0x3f | 0x80,
			code >> 6 & 0x3f | 0x80,
			code & 0x3f | 0x80,
		]);
	},
} as const satisfies EncoderObject<number>;
