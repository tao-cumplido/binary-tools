import { regex } from "regex";
import { match, P } from "ts-pattern";

import { reHexDigit, type ByteValidator, type Pattern, type PatternRegExp } from "./shared.js";

export const reWildcard = regex`^
	(?<upper>${reHexDigit}|\?)
	(?<lower>${reHexDigit}|\?)
$` as PatternRegExp<{ upper: string; lower: string; }>;

export const wildcardPattern: Pattern = (pattern) => {
	return match(reWildcard.exec(pattern)?.groups)
		.returnType<ByteValidator | null>()
		.with(P.nullish, () => {
			return null;
		})
		.with({ upper: "?", lower: "?", }, () => {
			return () => true;
		})
		.with({ upper: "?", }, ({ lower, }) => {
			const value = parseInt(lower, 16);
			return (byte) => (byte & 0x0f) === value;
		})
		.with({ lower: "?", }, ({ upper, }) => {
			const value = parseInt(upper, 16) << 4;
			return (byte) => (byte & 0xf0) === value;
		})
		.otherwise(({ upper, lower, }) => {
			const value = parseInt(`${upper}${lower}`, 16);
			return (byte) => byte === value;
		});
};
