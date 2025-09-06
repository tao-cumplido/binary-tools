
import type { ByteOrder } from "#byte-order.ts";
import type { encodingName, Char } from "#datatypes/char/util.ts";
import type { Codec } from "#datatypes/codec.ts";
import { arrayDecoder } from "#datatypes/array/decode.ts";
import { arrayEncoder } from "#datatypes/array/encode.ts";
import { bigintDecoder } from "#datatypes/bigint/decode.ts";
import { bigintEncoder } from "#datatypes/bigint/encode.ts";
import { bytesDecoder } from "#datatypes/bytes/decode.ts";
import { bytesEncoder } from "#datatypes/bytes/encode.ts";
import { CharAsciiDecoder } from "#datatypes/char/ascii/decode.ts";
import { CharAsciiEncoder } from "#datatypes/char/ascii/encode.ts";
import { CharIso8859_1Decoder } from "#datatypes/char/iso-8859-1/decode.ts";
import { CharIso8859_1Encoder } from "#datatypes/char/iso-8859-1/encode.ts";
import { CharUtf8Decoder } from "#datatypes/char/utf-8/decode.ts";
import { CharUtf8Encoder } from "#datatypes/char/utf-8/encode.ts";
import { CharUtf16Decoder } from "#datatypes/char/utf-16/decode.ts";
import { CharUtf16Encoder } from "#datatypes/char/utf-16/encode.ts";
import { CharUtf32Decoder } from "#datatypes/char/utf-32/decode.ts";
import { CharUtf32Encoder } from "#datatypes/char/utf-32/encode.ts";
import { floatDecoder } from "#datatypes/float/decode.ts";
import { floatEncoder } from "#datatypes/float/encode.ts";
import { intDecoder } from "#datatypes/int/decode.ts";
import { intEncoder } from "#datatypes/int/encode.ts";
import { stringDecoder, stringDecoderTerminated, type StringOptions } from "#datatypes/string/decode.ts";
import { stringEncoder } from "#datatypes/string/encode.ts";

import type { Decoder, FloatConfig, IntDecoderConfig as IntConfig, SafeIntBytes } from "./decoder.ts";
import type { Encoder } from "./encoder.ts";

export type { Codec } from "#datatypes/codec.ts";

export { DecodeError, type Decoder } from "./decoder.ts";
export { EncodeError, type Encoder } from "./encoder.ts";

export const bigint = (config: IntConfig, byteOrder?: ByteOrder) => {
	return {
		...bigintDecoder(config, byteOrder),
		...bigintEncoder(config, byteOrder),
	} as const satisfies Codec<bigint>;
};

export const BigUint64 = bigint({ signed: false, byteLength: 8, });
export const BigInt64 = bigint({ signed: true, byteLength: 8, });

export const int = (config: IntConfig<SafeIntBytes>, byteOrder?: ByteOrder) => {
	return {
		...intDecoder(config, byteOrder),
		...intEncoder(config, byteOrder),
	} as const satisfies Codec<number>;
};

export const Uint8 = int({ signed: false, byteLength: 1, });
export const Uint16 = int({ signed: false, byteLength: 2, });
export const Uint32 = int({ signed: false, byteLength: 4, });
export const Int8 = int({ signed: true, byteLength: 1, });
export const Int16 = int({ signed: true, byteLength: 2, });
export const Int32 = int({ signed: true, byteLength: 4, });

export const float = (config: FloatConfig, byteOrder?: ByteOrder) => {
	return {
		...floatDecoder(config, byteOrder),
		...floatEncoder(config, byteOrder),
	} as const satisfies Codec<number>;
};

export const Float16 = float({ byteLength: 2, });
export const Float32 = float({ byteLength: 4, });
export const Float64 = float({ byteLength: 8, });

export const CharAscii = { ...CharAsciiDecoder, ...CharAsciiEncoder, } satisfies Char<Codec<number>>;
export const CharIso8859_1 = { ...CharIso8859_1Decoder, ...CharIso8859_1Encoder, } satisfies Char<Codec<number>>;
export const CharUtf8 = { ...CharUtf8Decoder, ...CharUtf8Encoder, } satisfies Char<Codec<number>>;
export const CharUtf16 = { ...CharUtf16Decoder, ...CharUtf16Encoder, } satisfies Char<Codec<number>>;
export const CharUtf32 = { ...CharUtf32Decoder, ...CharUtf32Encoder, } satisfies Char<Codec<number>>;

// @ts-expect-error
export const bytes: typeof bytesDecoder & typeof bytesEncoder = (count?: number) => {
	if (typeof count === "number") {
		return bytesDecoder(count);
	}

	return bytesEncoder();
};

// @ts-expect-error
export const array: typeof arrayDecoder & typeof arrayEncoder = <Value>(
	type: Decoder<Value> | Encoder<Value>,
	countOrByteOrder: number | ByteOrder | undefined,
	byteOrder: ByteOrder | undefined,
) => {
	if (typeof countOrByteOrder === "number") {
		return arrayDecoder(type as Decoder<Value>, countOrByteOrder, byteOrder);
	}

	return arrayEncoder(type as Encoder<Value>, countOrByteOrder);
};

export type StringFactory = {
	(char: Codec<number>, options?: Pick<StringOptions, "terminator">, byteOrder?: ByteOrder): Codec<string>;
} & typeof stringDecoder;

// @ts-expect-error
export const string: StringFactory = (char, options = {}, byteOrder) => {
	if ("count" in options || "byteLength" in options) {
		return stringDecoder(char, options as StringOptions, byteOrder);
	}

	if ("decode" in char && "encode" in char) {
		return {
			...stringDecoderTerminated(char, options.terminator, byteOrder),
			...stringEncoder(char, options, byteOrder),
		};
	}

	return stringDecoder(char, options, byteOrder);
};

export {
	BinaryData,
	type BinaryDataConfig,
	type FindOptions,
	type SearchItem,
	type SearchProgress,
	type SeekOptions,
	type UpdateBufferFunction,
	type UpdateBufferState,
} from "#binary-data.ts";

export { ByteOrder } from "#byte-order.ts";
export { ReadMode } from "#read-mode.ts";
