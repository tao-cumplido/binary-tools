import { match } from "ts-pattern";

import type { EncoderObject } from "#datatypes/encoder.js";
import { assertInt } from "#assert.js";
import { ByteOrder } from "#byte-order.js";
import { EncodeError } from "#datatypes/errors.js";

import type { FloatConfig } from "./config.js";

export const floatEncoder = ({ byteLength, }: FloatConfig, overrideByteOrder?: ByteOrder) => {
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
		} as const satisfies EncoderObject<number>;
};

export const Float16Encoder = floatEncoder({ byteLength: 2, });
export const Float32Encoder = floatEncoder({ byteLength: 4, });
export const Float64Encoder = floatEncoder({ byteLength: 8, });
