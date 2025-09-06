export {
	getDecoderObject,
	validateResult,
	type Decoder,
	type DecoderFunction,
	type DecoderObject,
	type DecoderResult,
	type DecoderState,
	type QueryState,
	type QueryStateResult,
} from "#datatypes/decoder.ts";

export { DecodeError } from "#datatypes/errors.ts";

export type { IntDecoderConfig } from "#datatypes/bigint/config.ts";
export {
	bigintDecoder as bigint,
	BigInt64Decoder as BigInt64,
	BigUint64Decoder as BigUint64,
} from "#datatypes/bigint/decode.ts";

export type { SafeIntBytes } from "#datatypes/int/config.ts";
export {
	intDecoder as int,
	Int8Decoder as Int8,
	Int8DecoderBE as Int8BE,
	Int8DecoderLE as Int8LE,
	Int16Decoder as Int16,
	Int16DecoderBE as Int16BE,
	Int16DecoderLE as Int16LE,
	Int32Decoder as Int32,
	Int32DecoderBE as Int32BE,
	Int32DecoderLE as Int32LE,
	Uint8Decoder as Uint8,
	Uint8DecoderBE as Uint8BE,
	Uint8DecoderLE as Uint8LE,
	Uint16Decoder as Uint16,
	Uint16DecoderBE as Uint16BE,
	Uint16DecoderLE as Uint16LE,
	Uint32Decoder as Uint32,
	Uint32DecoderBE as Uint32BE,
	Uint32DecoderLE as Uint32LE,
} from "#datatypes/int/decode.ts";

export type { FloatBytes, FloatConfig } from "#datatypes/float/config.ts";
export {
	floatDecoder as float,
	Float16Decoder as Float16,
	Float32Decoder as Float32,
	Float64Decoder as Float64,
} from "#datatypes/float/decode.ts";

export { CharAsciiDecoder as CharAscii } from "#datatypes/char/ascii/decode.ts";
export { CharIso8859_1Decoder as CharIso8859_1 } from "#datatypes/char/iso-8859-1/decode.ts";
export { CharUtf8Decoder as CharUtf8 } from "#datatypes/char/utf-8/decode.ts";
export { CharUtf16Decoder as CharUtf16 } from "#datatypes/char/utf-16/decode.ts";
export { CharUtf32Decoder as CharUtf32 } from "#datatypes/char/utf-32/decode.ts";

export { arrayDecoder as array } from "#datatypes/array/decode.ts";
export { bytesDecoder as bytes } from "#datatypes/bytes/decode.ts";
export { stringDecoder as string } from "#datatypes/string/decode.ts";
