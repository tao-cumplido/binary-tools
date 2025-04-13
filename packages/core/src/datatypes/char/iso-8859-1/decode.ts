import type { DecoderObject } from "#datatypes/decoder.js";
import { DecodeError } from "#datatypes/errors.js";
import { Uint8Decoder } from "#datatypes/int/decode.js";

export const CharIso8859_1Decoder = {
	requiredBufferSize: 1,
	decode: ({ buffer, offset, }) => {
		const { value, source, } = Uint8Decoder.decode({ buffer, offset, });

		if (value < 0x20 || (value >= 0x7f && value < 0xa0)) {
			throw new DecodeError("Invalid ISO 8859-1 bytes", new Uint8Array([ value, ]));
		}

		return {
			value,
			source,
		};
	},
} as const satisfies DecoderObject<number>;
