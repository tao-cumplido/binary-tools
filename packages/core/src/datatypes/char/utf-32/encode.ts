import type { EncoderObject } from "#datatypes/encoder.js";
import { EncodeError } from "#datatypes/errors.js";
import { Int32Encoder } from "#datatypes/int/encode.js";

import { isInvalidUnicodeCodePoint } from "../util.js";

export const CharUtf32Encoder = {
	encode: (code, byteOrder) => {
		if (isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid Unicode code point`, code);
		}

		return Int32Encoder.encode(code, byteOrder);
	},
} satisfies EncoderObject<number>;
