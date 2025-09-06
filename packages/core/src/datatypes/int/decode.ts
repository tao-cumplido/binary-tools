import type { IntDecoderConfig } from "#datatypes/bigint/config.ts";
import type { DecoderObject } from "#datatypes/decoder.ts";
import { assertInt } from "#assert.ts";
import { ByteOrder } from "#byte-order.ts";
import { bigintDecoder } from "#datatypes/bigint/decode.ts";

import type { SafeIntBytes } from "./config.ts";

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

export const Uint8DecoderBE = intDecoder({ signed: false, byteLength: 1, }, ByteOrder.BigEndian);
export const Uint16DecoderBE = intDecoder({ signed: false, byteLength: 2, }, ByteOrder.BigEndian);
export const Uint32DecoderBE = intDecoder({ signed: false, byteLength: 4, }, ByteOrder.BigEndian);
export const Int8DecoderBE = intDecoder({ signed: true, byteLength: 1, }, ByteOrder.BigEndian);
export const Int16DecoderBE = intDecoder({ signed: true, byteLength: 2, }, ByteOrder.BigEndian);
export const Int32DecoderBE = intDecoder({ signed: true, byteLength: 4, }, ByteOrder.BigEndian);

export const Uint8DecoderLE = intDecoder({ signed: false, byteLength: 1, }, ByteOrder.LittleEndian);
export const Uint16DecoderLE = intDecoder({ signed: false, byteLength: 2, }, ByteOrder.LittleEndian);
export const Uint32DecoderLE = intDecoder({ signed: false, byteLength: 4, }, ByteOrder.LittleEndian);
export const Int8DecoderLE = intDecoder({ signed: true, byteLength: 1, }, ByteOrder.LittleEndian);
export const Int16DecoderLE = intDecoder({ signed: true, byteLength: 2, }, ByteOrder.LittleEndian);
export const Int32DecoderLE = intDecoder({ signed: true, byteLength: 4, }, ByteOrder.LittleEndian);
