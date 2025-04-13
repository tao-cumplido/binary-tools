import type { ByteOrder } from "#byte-order.js";

export type DecoderState = {
	readonly buffer: Uint8Array;
	readonly offset: number;
	readonly byteOrder?: ByteOrder | undefined;
};

export type DecoderResult<T> = {
	readonly source: Uint8Array;
	readonly value: T;
};

export type QueryStateResult = Pick<DecoderState, "buffer" | "offset">;

export type QueryState = (advanceBytes: number, bufferSize?: number) => Promise<QueryStateResult>;

export type DecoderFunction<T> = (initialState: DecoderState, queryState: QueryState) => DecoderResult<T> | Promise<DecoderResult<T>>;

export type DecoderObject<T> = {
	readonly requiredBufferSize: number;
	readonly decode: DecoderFunction<T>;
};

export type Decoder<T> = DecoderFunction<T> | DecoderObject<T>;

export function getDecoderObject<T>(decoder: Decoder<T>): DecoderObject<T> {
	if (typeof decoder === "function") {
		return {
			decode: decoder,
			requiredBufferSize: 1,
		};
	}

	return decoder;
}

export function validateResult<T>(result: DecoderResult<T>, message = ""): DecoderResult<T> {
	if (result.source.byteLength === 0) {
		throw new Error(message);
	}

	return result;
}
