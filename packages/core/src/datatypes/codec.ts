
import type { Simplify } from "type-fest";

import type { DecoderObject } from "./decoder.ts";
import type { EncoderObject } from "./encoder.ts";

export type Codec<T> = Simplify<DecoderObject<T> & EncoderObject<T>>;
