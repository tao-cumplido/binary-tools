import type { ByteOrder } from "#byte-order.js";
import type { IntDecoderConfig } from "#datatypes/bigint/config.js";
import type { DecoderObject } from "#datatypes/decoder.js";
import { assertInt } from "#assert.js";
import { bigintDecoder } from "#datatypes/bigint/decode.js";

import type { SafeIntBytes } from "./config.js";

export const intDecoder = ({ signed, byteLength, }: IntDecoderConfig<SafeIntBytes>, byteOrder?: ByteOrder) => {
	assertInt(byteLength, { min: 1, max: 6, });

	const bigint = bigintDecoder({ signed, byteLength, }, byteOrder);

	return {
		requiredBufferSize: byteLength,
		decode: (state) => {
			const { value, source, } = bigint.decode(state);
			return {
				value: Number(value),
				source,
			};
		},
	} as const satisfies DecoderObject<number>;
};

export const Uint8Decoder = intDecoder({ signed: false, byteLength: 1, });
export const Uint16Decoder = intDecoder({ signed: false, byteLength: 2, });
export const Uint32Decoder = intDecoder({ signed: false, byteLength: 4, });
export const Int8Decoder = intDecoder({ signed: true, byteLength: 1, });
export const Int16Decoder = intDecoder({ signed: true, byteLength: 2, });
export const Int32Decoder = intDecoder({ signed: true, byteLength: 4, });
