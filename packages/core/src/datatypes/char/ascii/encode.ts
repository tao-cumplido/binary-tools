import type { EncoderObject } from "#datatypes/encoder.ts";
import { EncodeError } from "#datatypes/errors.ts";

import { encodingName, isInvalidUnicodeCodePoint, type Char } from "../util.ts";

export const CharAsciiEncoder = {
	[encodingName]: "ASCII",
	encode: (code) => {
		if (code >= 0x80 || isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid ASCII code point.`, code);
		}

		return new Uint8Array([ code, ]);
	},
} as const satisfies Char<EncoderObject<number>>;
