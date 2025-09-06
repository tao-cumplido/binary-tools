import type { DecoderObject, DecoderResult } from "#datatypes/decoder.ts";
import { assertInt } from "#assert.ts";

function identity(value: Uint8Array): DecoderResult<Uint8Array> {
	return {
		value,
		source: value,
	};
}

export const bytesDecoder = (count: number) => {
	assertInt(count, { min: 0, });

	return {
		requiredBufferSize: 1,
		decode: async ({ buffer, offset, }, queryState) => {
			if (offset + count <= buffer.byteLength) {
				return identity(buffer.subarray(offset, offset + count));
			}

			const value = new Uint8Array(count);

			let n = 0;

			while (n < count) {
				const part = buffer.subarray(offset, Math.min(buffer.byteLength, offset + count - n));
				value.set(part, n);
				n += part.byteLength;
				({ buffer, offset, } = await queryState(part.byteLength));
			}

			return identity(value);
		},
	} as const satisfies DecoderObject<Uint8Array>;
};
