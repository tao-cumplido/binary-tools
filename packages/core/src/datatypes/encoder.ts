import type { ByteOrder } from "#byte-order.js";

export type EncoderFunction<T> = (value: T, byteOrder?: ByteOrder) => Uint8Array;

export type EncoderObject<T> = {
	readonly encode: EncoderFunction<T>;
};

export type Encoder<T> = EncoderFunction<T> | EncoderObject<T>;
