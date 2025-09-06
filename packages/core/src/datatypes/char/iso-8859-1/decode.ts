import type { DecoderObject } from "#datatypes/decoder.ts";
import { DecodeError } from "#datatypes/errors.ts";
import { Uint8Decoder } from "#datatypes/int/decode.ts";

import { encodingName, type Char } from "../util.ts";

export const CharIso8859_1Decoder = {
	[encodingName]: "ISO 8859-1",
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
} as const satisfies Char<DecoderObject<number>>;
