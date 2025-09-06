import type { ByteOrder } from "#byte-order.ts";
import type { Encoder, EncoderObject } from "#datatypes/encoder.ts";
import { arrayEncoder } from "#datatypes/array/encode.ts";

export type StringEncoderConfig = {
	readonly terminator?: string;
};

export const stringEncoder = (char: Encoder<number>, { terminator = "", }: StringEncoderConfig = {}, overrideByteOrder?: ByteOrder): EncoderObject<string> => {
	const array = arrayEncoder(char, overrideByteOrder);

	return {
		encode: (value, byteOrder) => {
			// codePointAt(0) cannot return undefined here as it does so only for the empty string which wouldn't invoke the map fn
			return array.encode([ ...(value + terminator), ].map((c) => c.codePointAt(0)!), byteOrder);
		},
	};
};
