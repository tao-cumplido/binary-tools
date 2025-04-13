import type { DecoderObject } from "#datatypes/decoder.js";
import { DecodeError } from "#datatypes/errors.js";
import { Uint8Decoder } from "#datatypes/int/decode.js";

export const CharUtf8Decoder = {
	requiredBufferSize: 4,
	decode: ({ buffer, offset, }) => {
		const { value: byte1, } = Uint8Decoder.decode({ buffer, offset, });

		offset += 1;

		let source = new Uint8Array([ byte1, ]);

		if (byte1 < 0x80) {
			return {
				value: byte1,
				source,
			};
		}

		const invalidMessage = "Invalid UTF-8 bytes";
		const incompleteMessage = "Incomplete UTF-8 bytes";

		if (byte1 < 0xc2 || byte1 > 0xf4) {
			throw new DecodeError(invalidMessage, source);
		}

		if (offset >= buffer.length) {
			throw new DecodeError(incompleteMessage, source);
		}

		const isInvalid = (...bytes: number[]) => bytes.some((byte) => byte < 0x80 || byte > 0xbf);

		const { value: byte2, } = Uint8Decoder.decode({ buffer, offset, });

		offset += 1;

		source = new Uint8Array([ byte1, byte2, ]);

		if (byte1 < 0xe0) {
			if (isInvalid(byte2)) {
				throw new DecodeError(invalidMessage, source);
			}

			return {
				value: ((byte1 & 0x1f) << 6) + (byte2 & 0x3f),
				source,
			};
		}

		if (offset >= buffer.length) {
			throw new DecodeError(incompleteMessage, source);
		}

		const { value: byte3, } = Uint8Decoder.decode({ buffer, offset, });

		offset += 1;

		source = new Uint8Array([ byte1, byte2, byte3, ]);

		if (byte1 < 0xf0) {
			if ((byte1 === 0xe0 && byte2 < 0xa0) || (byte1 === 0xed && byte2 > 0x9f) || isInvalid(byte2, byte3)) {
				throw new DecodeError(invalidMessage, source);
			}

			return {
				value: ((byte1 & 0x0f) << 12) + ((byte2 & 0x3f) << 6) + (byte3 & 0x3f),
				source,
			};
		}

		if (offset >= buffer.length) {
			throw new DecodeError(incompleteMessage, source);
		}

		const { value: byte4, } = Uint8Decoder.decode({ buffer, offset, });

		offset += 1;

		source = new Uint8Array([ byte1, byte2, byte3, byte4, ]);

		if ((byte1 === 0xf0 && byte2 < 0x90) || (byte1 === 0xf4 && byte2 > 0x8f) || isInvalid(byte2, byte3, byte4)) {
			throw new DecodeError(invalidMessage, source);
		}

		return {
			value: ((byte1 & 0x07) << 18) + ((byte2 & 0x3f) << 12) + ((byte3 & 0x3f) << 6) + (byte4 & 0x3f),
			source,
		};
	},
} as const satisfies DecoderObject<number>;
