import type { DecoderObject } from "#datatypes/decoder.js";
import { DecodeError } from "#datatypes/errors.js";
import { Uint8Decoder } from "#datatypes/int/decode.js";

export const CharAsciiDecoder = {
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
} as const satisfies DecoderObject<number>;
