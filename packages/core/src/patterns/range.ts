import { regex } from "regex";
import { match, P } from "ts-pattern";

import { reHexDigit, type ByteValidator, type Pattern, type PatternRegExp } from "./shared.ts";

export const reRange = regex`^
	(?<minBracket>\(|\[)
	(?<min>${reHexDigit}{1,2})
	,
	(?<max>${reHexDigit}{1,2})
	(?<maxBracket>\)|\])
$` as PatternRegExp<{ minBracket: "(" | "["; min: string; max: string; maxBracket: ")" | "]"; }>;

export const rangePattern: Pattern = (pattern) => {
	return match(reRange.exec(pattern)?.groups)
		.with(P.nullish, () => {
			return null;
		})
		.with(P.any, ({ min, max, minBracket, maxBracket, }) => {
			const minValue = parseInt(min, 16);
			const maxValue = parseInt(max, 16);
			return match([ minBracket, maxBracket, ])
				.returnType<ByteValidator>()
				.with([ "(", ")", ], () => {
					return (byte) => byte > minValue && byte < maxValue;
				})
				.with([ "(", "]", ], () => {
					return (byte) => byte > minValue && byte <= maxValue;
				})
				.with([ "[", ")", ], () => {
					return (byte) => byte >= minValue && byte < maxValue;
				})
				.with([ "[", "]", ], () => {
					return (byte) => byte >= minValue && byte <= maxValue;
				})
				.exhaustive();
		})
		.exhaustive();
};
