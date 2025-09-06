import { match } from "ts-pattern";

import type { EncoderObject } from "#datatypes/encoder.ts";
import { assertInt } from "#assert.ts";
import { ByteOrder } from "#byte-order.ts";
import { EncodeError } from "#datatypes/errors.ts";

import type { FloatConfig } from "./config.ts";

export const floatEncoder = ({ byteLength, }: FloatConfig, overrideByteOrder?: ByteOrder): EncoderObject<number> => {
	assertInt(byteLength, { values: [ 2, 4, 8, ], });

	const setFloat = match(byteLength)
		.with(2, () => DataView.prototype.setFloat16)
		.with(4, () => DataView.prototype.setFloat32)
		.with(8, () => DataView.prototype.setFloat64)
		.exhaustive();

		return {
			encode: (value, byteOrder) => {
				byteOrder = overrideByteOrder ?? byteOrder;

				if (!byteOrder) {
					throw new EncodeError("Cannot encode float value with unspecified byte order.", value);
				}

				const view = new DataView(new ArrayBuffer(byteLength));
				setFloat.call(view, 0, value, byteOrder === ByteOrder.LittleEndian);

				return new Uint8Array(view.buffer);
			},
		};
};

export const Float16Encoder = floatEncoder({ byteLength: 2, });
export const Float32Encoder = floatEncoder({ byteLength: 4, });
export const Float64Encoder = floatEncoder({ byteLength: 8, });
