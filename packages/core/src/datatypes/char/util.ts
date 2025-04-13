export function isInvalidUnicodeCodePoint(code: number) {
	return code < 0 || (code >= 0xd800 && code < 0xe000) || code > 0x10ffff;
}
