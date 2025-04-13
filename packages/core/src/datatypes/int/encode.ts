
import type { ByteOrder } from "#byte-order.js";
import type { IntEncoderConfig } from "#datatypes/bigint/config.js";
import type { EncoderObject } from "#datatypes/encoder.js";
import { assertInt } from "#assert.js";
import { bigintEncoder } from "#datatypes/bigint/encode.js";

import type { SafeIntBytes } from "./config.js";

export const intEncoder = ({ byteLength, }: IntEncoderConfig<SafeIntBytes>, overrideByteOrder?: ByteOrder) => {
	assertInt(byteLength, { min: 1, max: 6, });

	const bigint = bigintEncoder({ byteLength, }, overrideByteOrder);

	return {
		encode: (value, byteOrder) => {
			return bigint.encode(BigInt(value), byteOrder);
		},
	} as const satisfies EncoderObject<number>;
};

export const Int8Encoder = intEncoder({ byteLength: 1, });
export const Int16Encoder = intEncoder({ byteLength: 2, });
export const Int32Encoder = intEncoder({ byteLength: 4, });
