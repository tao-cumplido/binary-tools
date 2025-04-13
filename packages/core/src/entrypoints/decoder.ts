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
} from "#datatypes/decoder.js";

export { DecodeError } from "#datatypes/errors.js";

export type { IntDecoderConfig } from "#datatypes/bigint/config.js";
export {
	bigintDecoder as bigint,
	BigInt64Decoder as BigInt64,
	BigUint64Decoder as BigUint64,
} from "#datatypes/bigint/decode.js";

export type { SafeIntBytes } from "#datatypes/int/config.js";
export {
	intDecoder as int,
	Int8Decoder as Int8,
	Int16Decoder as Int16,
	Int32Decoder as Int32,
	Uint8Decoder as Uint8,
	Uint16Decoder as Uint16,
	Uint32Decoder as Uint32,
} from "#datatypes/int/decode.js";

export type { FloatBytes, FloatConfig } from "#datatypes/float/config.js";
export {
	floatDecoder as float,
	Float16Decoder as Float16,
	Float32Decoder as Float32,
	Float64Decoder as Float64,
} from "#datatypes/float/decode.js";

export { CharAsciiDecoder as CharAscii } from "#datatypes/char/ascii/decode.js";
export { CharIso8859_1Decoder as CharIso8859_1 } from "#datatypes/char/iso-8859-1/decode.js";
export { CharUtf8Decoder as CharUtf8 } from "#datatypes/char/utf-8/decode.js";
export { CharUtf16Decoder as CharUtf16 } from "#datatypes/char/utf-16/decode.js";
export { CharUtf32Decoder as CharUtf32 } from "#datatypes/char/utf-32/decode.js";

export { arrayDecoder as array } from "#datatypes/array/decode.js";
export { bytesDecoder as bytes } from "#datatypes/bytes/decode.js";
export { stringDecoder as string } from "#datatypes/string/decode.js";
