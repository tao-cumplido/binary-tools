import type { ReadonlyTuple, Writable } from "type-fest";

import type { ByteOrder } from "#byte-order.js";
import { assertInt } from "#assert.js";
import { getDecoderObject, validateResult, type Decoder, type DecoderObject, type DecoderResult } from "#datatypes/decoder.js";
import { repeat } from "#repeat.js";

type ArrayResult<Value, Count extends number> = Writable<ReadonlyTuple<Value, Count>>;

function combine<Value>(items: readonly DecoderResult<Value>[]): DecoderResult<Value[]> {
	let byteLength = 0;

	for (const { source, } of items) {
		byteLength += source.byteLength;
	}

	const value: Value[] = [];
	const source = new Uint8Array(byteLength);

	let offset = 0;

	for (const item of items) {
		value.push(item.value);
		source.set(item.source, offset);
		offset += item.source.byteLength;
	}

	return { value, source, };
}

export const errorMessage = {
	invalidItem: (index: number) => `Invalid array item at index ${index} produced an empty source buffer`,
} as const;

export const arrayDecoder = <Value, Count extends number>(type: Decoder<Value>, count: Count, overrideByteOrder?: ByteOrder) => {
	assertInt(count, { min: 0, });

	const { decode: decodeItem, requiredBufferSize, } = getDecoderObject(type);

	return {
		requiredBufferSize,
		decode: async ({ buffer, offset, byteOrder, }, queryState) => {
			byteOrder = overrideByteOrder ?? byteOrder;

			const items = await repeat(count, async (index) => {
				const potentialResult = decodeItem({ buffer, offset, byteOrder, }, queryState);

				if (potentialResult instanceof Promise) {
					const result = await potentialResult;
					validateResult(result, errorMessage.invalidItem(index));
					({ buffer, offset, } = await queryState(0));
					return result;
				}

				validateResult(potentialResult, errorMessage.invalidItem(index));

				({ buffer, offset, } = await queryState(potentialResult.source.byteLength, requiredBufferSize));

				return potentialResult;
			});

			return combine(items) as DecoderResult<ArrayResult<Value, Count>>;
		},
	} as const satisfies DecoderObject<ArrayResult<Value, Count>>;
};
