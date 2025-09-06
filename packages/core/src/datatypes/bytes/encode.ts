import type { EncoderObject } from "#datatypes/encoder.ts";

export const bytesEncoder = (): EncoderObject<Uint8Array> => {
	return {
		encode: (value) => value,
	};
};
