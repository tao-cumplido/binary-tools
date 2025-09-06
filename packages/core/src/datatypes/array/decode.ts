import type { ReadonlyTuple, Writable } from "type-fest";

import type { ByteOrder } from "#byte-order.ts";
import { assertInt } from "#assert.ts";
import { getDecoderObject, resolveRequiredBufferSize, validateResult, type Decoder, type DecoderObject, type DecoderResult } from "#datatypes/decoder.ts";

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
	const { max, } = resolveRequiredBufferSize(requiredBufferSize);

	return {
		requiredBufferSize,
		decode: async ({ buffer, offset, byteOrder, }, queryState) => {
			byteOrder = overrideByteOrder ?? byteOrder;

			const items: DecoderResult<Value>[] = [];

			for (let i = 0; i < count; i++) {
				const potentialResult = decodeItem({ buffer, offset, byteOrder, }, queryState);

				if (potentialResult instanceof Promise) {
					const result = await potentialResult;
					validateResult(result, errorMessage.invalidItem(i));
					({ buffer, offset, } = await queryState(0));
					items.push(result);
				} else {
					validateResult(potentialResult, errorMessage.invalidItem(i));
					({ buffer, offset, } = await queryState(potentialResult.source.byteLength, max));
					items.push(potentialResult);
				}
			}

			return combine(items) as DecoderResult<ArrayResult<Value, Count>>;
		},
	} as const satisfies DecoderObject<ArrayResult<Value, Count>>;
};
