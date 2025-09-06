import { match } from "ts-pattern";

import type { DecoderObject } from "#datatypes/decoder.ts";
import { assertInt } from "#assert.ts";
import { ByteOrder } from "#byte-order.ts";
import { DecodeError } from "#datatypes/errors.ts";

import type { FloatConfig } from "./config.ts";

export const errorMessage = {
	noByteOrder: (byteLength: number) => `Cannot decode ${byteLength} bytes float with unspecified byte order`,
} as const;

export const floatDecoder = ({ byteLength, }: FloatConfig, overrideByteOrder?: ByteOrder) => {
	assertInt(byteLength, { values: [ 2, 4, 8, ], });

	const getFloat = match(byteLength)
		.with(2, () => DataView.prototype.getFloat16)
		.with(4, () => DataView.prototype.getFloat32)
		.with(8, () => DataView.prototype.getFloat64)
		.exhaustive();

	return {
		requiredBufferSize: byteLength,
		decode: ({ buffer, offset, byteOrder, }) => {
			const source = buffer.subarray(offset, offset + byteLength);

			byteOrder = overrideByteOrder ?? byteOrder;

			if (!byteOrder) {
				throw new DecodeError(errorMessage.noByteOrder(byteLength), source);
			}

			const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			const value = getFloat.call(view, offset, byteOrder === ByteOrder.LittleEndian);

			return {
				value,
				source,
			};
		},
	} as const satisfies DecoderObject<number>;
};

export const Float16Decoder = floatDecoder({ byteLength: 2, });
export const Float32Decoder = floatDecoder({ byteLength: 4, });
export const Float64Decoder = floatDecoder({ byteLength: 8, });
