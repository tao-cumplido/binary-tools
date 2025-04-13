import type { EncoderObject } from "#datatypes/encoder.js";
import { EncodeError } from "#datatypes/errors.js";

import { isInvalidUnicodeCodePoint } from "../util.js";

export const CharAsciiEncoder = {
	encode: (code) => {
		if (code >= 0x80 || isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid ASCII code point.`, code);
		}

		return new Uint8Array([ code, ]);
	},
} as const satisfies EncoderObject<number>;
