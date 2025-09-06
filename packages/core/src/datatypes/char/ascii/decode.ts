import type { DecoderObject } from "#datatypes/decoder.ts";
import { DecodeError } from "#datatypes/errors.ts";
import { Uint8Decoder } from "#datatypes/int/decode.ts";

import { encodingName, type Char } from "../util.ts";

export const CharAsciiDecoder = {
	[encodingName]: "ASCII",
	requiredBufferSize: 1,
	decode: ({ buffer, offset, }) => {
		const { value, source, } = Uint8Decoder.decode({ buffer, offset, });

		if (value >= 0x80) {
			throw new DecodeError("Invalid ASCII bytes", source);
		}

		return {
			value,
			source,
		};
	},
} as const satisfies Char<DecoderObject<number>>;
