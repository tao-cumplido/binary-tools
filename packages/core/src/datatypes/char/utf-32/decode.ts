import type { DecoderObject } from "#datatypes/decoder.js";
import { DecodeError } from "#datatypes/errors.js";
import { Uint32Decoder } from "#datatypes/int/decode.js";

import { isInvalidUnicodeCodePoint } from "../util.js";

export const CharUtf32Decoder = {
	requiredBufferSize: 4,
	decode: ({ buffer, offset, byteOrder, }) => {
		const { value, source, } = Uint32Decoder.decode({ buffer, offset, byteOrder, });

		if (isInvalidUnicodeCodePoint(value)) {
			throw new DecodeError(`Invalid UTF-32 code point`, source);
		}

		return {
			value: value,
			source,
		};
	},
} as const satisfies DecoderObject<number>;
