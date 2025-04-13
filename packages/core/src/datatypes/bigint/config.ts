import type { Simplify } from "type-fest";

export type IntDecoderConfig<ByteLength extends number = number> = {
	readonly signed: boolean;
	readonly byteLength: ByteLength;
};

export type IntEncoderConfig<ByteLength extends number = number> = Simplify<Pick<IntDecoderConfig<ByteLength>, "byteLength">>;
