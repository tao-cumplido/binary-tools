
import type { ByteOrder } from "#byte-order.ts";
import type { IntEncoderConfig } from "#datatypes/bigint/config.ts";
import type { EncoderObject } from "#datatypes/encoder.ts";
import { assertInt } from "#assert.ts";
import { bigintEncoder } from "#datatypes/bigint/encode.ts";

import type { SafeIntBytes } from "./config.ts";

export const intEncoder = ({ byteLength, }: IntEncoderConfig<SafeIntBytes>, overrideByteOrder?: ByteOrder): EncoderObject<number> => {
	assertInt(byteLength, { min: 1, max: 6, });

	const bigint = bigintEncoder({ byteLength, }, overrideByteOrder);

	return {
		encode: (value, byteOrder) => {
			return bigint.encode(BigInt(value), byteOrder);
		},
	};
};

export const Int8Encoder = intEncoder({ byteLength: 1, });
export const Int16Encoder = intEncoder({ byteLength: 2, });
export const Int32Encoder = intEncoder({ byteLength: 4, });
