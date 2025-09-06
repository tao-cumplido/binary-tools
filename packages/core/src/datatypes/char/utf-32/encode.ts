import type { EncoderObject } from "#datatypes/encoder.ts";
import { EncodeError } from "#datatypes/errors.ts";
import { Int32Encoder } from "#datatypes/int/encode.ts";

import { encodingName, isInvalidUnicodeCodePoint, type Char } from "../util.ts";

export const CharUtf32Encoder = {
	[encodingName]: "UTF-32",
	encode: (code, byteOrder) => {
		if (isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid Unicode code point`, code);
		}

		return Int32Encoder.encode(code, byteOrder);
	},
} satisfies Char<EncoderObject<number>>;
