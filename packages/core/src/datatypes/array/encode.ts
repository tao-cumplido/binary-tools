import type { ByteOrder } from "#byte-order.ts";
import type { Encoder, EncoderObject } from "#datatypes/encoder.ts";

export const arrayEncoder = <Value>(type: Encoder<Value>, overrideByteOrder?: ByteOrder) => {
	const encodeItem = typeof type === "function" ? type : type.encode;

	return {
		encode: (value, byteOrder) => {
			byteOrder = overrideByteOrder ?? byteOrder;

			const sources: Uint8Array[] = [];
			let byteLength = 0;

			for (const item of value) {
				const source = encodeItem(item, byteOrder);
				sources.push(source);
				byteLength += source.byteLength;
			}

			const result = new Uint8Array(byteLength);
			let offset = 0;

			for (const source of sources) {
				result.set(source, offset);
				offset += source.byteLength;
			}

			return result;
		},
	} as const satisfies EncoderObject<readonly Value[]>;
};
