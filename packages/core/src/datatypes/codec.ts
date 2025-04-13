
import type { Simplify } from "type-fest";

import type { DecoderObject } from "./decoder.js";
import type { EncoderObject } from "./encoder.js";

export type Codec<T> = Simplify<DecoderObject<T> & EncoderObject<T>>;
