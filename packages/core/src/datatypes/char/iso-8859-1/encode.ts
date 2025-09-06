import type { EncoderObject } from "#datatypes/encoder.ts";
import { EncodeError } from "#datatypes/errors.ts";

import { encodingName, isInvalidUnicodeCodePoint, type Char } from "../util.ts";

export const CharIso8859_1Encoder = {
	[encodingName]: "ISO 8859-1",
	encode: (code) => {
		if (code < 0x20 || (code >= 0x7f && code < 0xa0) || isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid ISO 8859-1 code point`, code);
		}

		return new Uint8Array([ code, ]);
	},
} as const satisfies Char<EncoderObject<number>>;
