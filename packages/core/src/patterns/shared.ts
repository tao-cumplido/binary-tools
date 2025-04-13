import { regex } from "regex";

interface PatternExecResult<Groups> {
	readonly groups: Readonly<Groups>;
}

export interface PatternRegExp<Groups extends Record<string, string> | undefined = undefined> {
	exec(value: string): PatternExecResult<Groups> | null;
}

export type ByteValidator = (value: number, backreferences: Uint8Array) => boolean;
export type Pattern = (pattern: string) => ByteValidator | null;

export const reHexDigit = regex`[0-9a-fA-F]`;
