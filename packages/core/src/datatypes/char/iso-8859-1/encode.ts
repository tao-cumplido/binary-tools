import type { EncoderObject } from "#datatypes/encoder.js";
import { EncodeError } from "#datatypes/errors.js";

import { isInvalidUnicodeCodePoint } from "../util.js";

export const CharIso8859_1Encoder = {
	encode: (code) => {
		if (code < 0x20 || (code >= 0x7f && code < 0xa0) || isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid ISO 8859-1 code point`, code);
		}

		return new Uint8Array([ code, ]);
	},
} as const satisfies EncoderObject<number>;
