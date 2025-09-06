
import type { EncoderObject } from "#datatypes/encoder.ts";
import { assertInt } from "#assert.ts";
import { ByteOrder } from "#byte-order.ts";
import { EncodeError } from "#datatypes/errors.ts";

import type { IntEncoderConfig } from "./config.ts";

export const bigintEncoder = ({ byteLength, }: IntEncoderConfig, overrideByteOrder?: ByteOrder): EncoderObject<bigint> => {
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
	};
};

export const BigInt64Encoder = bigintEncoder({ byteLength: 8, });
