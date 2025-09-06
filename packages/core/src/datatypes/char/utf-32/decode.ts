import type { DecoderObject } from "#datatypes/decoder.ts";
import { DecodeError } from "#datatypes/errors.ts";
import { Uint32Decoder } from "#datatypes/int/decode.ts";

import { encodingName, isInvalidUnicodeCodePoint, type Char } from "../util.ts";

export const CharUtf32Decoder = {
	[encodingName]: "UTF-32",
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
} as const satisfies Char<DecoderObject<number>>;
