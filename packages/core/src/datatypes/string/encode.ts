import type { ByteOrder } from "#byte-order.js";
import type { Encoder, EncoderObject } from "#datatypes/encoder.js";
import { arrayEncoder } from "#datatypes/array/encode.js";

export type StringEncoderConfig = {
	readonly terminator?: string;
};

export const stringEncoder = (char: Encoder<number>, { terminator = "\0", }: StringEncoderConfig = {}, overrideByteOrder?: ByteOrder) => {
	const array = arrayEncoder(char, overrideByteOrder);

	return {
		encode: (value, byteOrder) => {
			// codePointAt(0) cannot return undefined here as it does so only for the empty string which wouldn't invoke the map fn
			return array.encode([ ...(value + terminator), ].map((c) => c.codePointAt(0)!), byteOrder);
		},
	} as const satisfies EncoderObject<string>;
};
