
import type { EncoderObject } from "#datatypes/encoder.js";
import { assertInt } from "#assert.js";
import { ByteOrder } from "#byte-order.js";
import { EncodeError } from "#datatypes/errors.js";

import type { IntEncoderConfig } from "./config.js";

export const bigintEncoder = ({ byteLength, }: IntEncoderConfig, overrideByteOrder?: ByteOrder) => {
	assertInt(byteLength, { min: 1, });

	return {
		encode: (value, byteOrder) => {
			byteOrder = overrideByteOrder ?? byteOrder;

			if (byteLength > 1 && !byteOrder) {
				throw new EncodeError(`Cannot encode ${byteLength} bytes integer with unspecified byte order`, value);
			}

			const result = new Uint8Array(byteLength);

			for (let i = 0; i < byteLength; i++) {
				const byte = (value >> BigInt(i * 8)) & 0xffn;
				const index = byteOrder === ByteOrder.LittleEndian ? i : byteLength - i - 1;
				result[index] = Number(byte);
			}

			return result;
		},
	} as const satisfies EncoderObject<bigint>;
};

export const BigInt64Encoder = bigintEncoder({ byteLength: 8, });
