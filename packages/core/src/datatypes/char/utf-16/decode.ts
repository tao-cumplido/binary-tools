import type { DecoderObject } from "#datatypes/decoder.ts";
import { DecodeError } from "#datatypes/errors.ts";
import { Uint16Decoder } from "#datatypes/int/decode.ts";

import { encodingName, type Char } from "../util.ts";

export const CharUtf16Decoder = {
	[encodingName]: "UTF-16",
	requiredBufferSize: {
		min: 2,
		max: 4,
	},
	decode: ({ buffer, offset, byteOrder, }) => {
		const high = Uint16Decoder.decode({ buffer, offset, byteOrder, });

		if (high.value < 0xd800 || high.value >= 0xe000) {
			return high;
		}

		const low = Uint16Decoder.decode({ buffer, offset: offset + 2, byteOrder, });

		const source = new Uint8Array(4);

		source.set(high.source, 0);
		source.set(low.source, 2);

		if (high.value >= 0xdc00 || low.value < 0xdc00 || low.value >= 0xe000) {
			throw new DecodeError(`Invalid UTF-16 bytes`, source);
		}

		return {
			value: (high.value - 0xd800) * 0x400 + (low.value - 0xdc00) + 0x10000,
			source,
		};
	},
} as const satisfies Char<DecoderObject<number>>;
