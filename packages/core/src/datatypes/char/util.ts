import type { Simplify } from "type-fest";

import type { DecoderObject } from "#datatypes/decoder.ts";
import type { EncoderObject } from "#datatypes/encoder.ts";

export type Char<T extends DecoderObject<number> | EncoderObject<number>> = Simplify<{ readonly [encodingName]: string; } & T>;

export const encodingName = Symbol("name");

export function isInvalidUnicodeCodePoint(code: number) {
	return code < 0 || (code >= 0xd800 && code < 0xe000) || code > 0x10ffff;
}
