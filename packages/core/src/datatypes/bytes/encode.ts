import type { EncoderObject } from "#datatypes/encoder.ts";

export const bytesEncoder = () => {
	return {
		encode: (value) => value,
	} as const satisfies EncoderObject<Uint8Array>;
};
