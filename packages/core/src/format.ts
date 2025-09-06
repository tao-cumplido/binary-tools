import { assertInt } from "#assert.ts";

export function hexByte(value: number | undefined) {
	assertInt(value, { min: 0x00, max: 0xff, });
	return "0x" + value.toString(16).padStart(2, "0");
}
