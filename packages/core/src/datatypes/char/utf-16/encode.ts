import type { EncoderObject } from "#datatypes/encoder.js";
import { EncodeError } from "#datatypes/errors.js";
import { Int16Encoder } from "#datatypes/int/encode.js";

import { isInvalidUnicodeCodePoint } from "../util.js";

export const CharUtf16Encoder = {
	encode: (code, byteOrder) => {
		if (isInvalidUnicodeCodePoint(code)) {
			throw new EncodeError(`Invalid Unicode code point`, code);
		}

		if (code < 0xd800 || (code >= 0xe000 && code < 0x10000)) {
			return Int16Encoder.encode(code, byteOrder);
		}

		const result = new Uint8Array(4);

		code = code - 0x10000;

		result.set(Int16Encoder.encode((code >> 10) + 0xd800, byteOrder), 0);
		result.set(Int16Encoder.encode((code & 0x3ff) + 0xdc00, byteOrder), 2);

		return result;
	},
} satisfies EncoderObject<number>;
