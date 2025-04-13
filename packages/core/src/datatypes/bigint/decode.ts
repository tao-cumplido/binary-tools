
import type { DecoderObject } from "#datatypes/decoder.js";
import { assertInt } from "#assert.js";
import { ByteOrder } from "#byte-order.js";
import { DecodeError } from "#datatypes/errors.js";

import type { IntDecoderConfig } from "./config.js";

export const errorMessage = {
	noByteOrder: (byteLength: number) => `Cannot decode ${byteLength} bytes integer with unspecified byte order`,
	unexpectedBufferEnd: (byteLength: number, offset: number) => `Couldn't read ${byteLength} bytes from offset ${offset}`,
} as const;

export const bigintDecoder = ({ signed, byteLength, }: IntDecoderConfig, overrideByteOrder?: ByteOrder) => {
	assertInt(byteLength, { min: 1, });

	return {
		requiredBufferSize: byteLength,
		decode: ({ buffer, offset, byteOrder, }) => {
			const source = buffer.subarray(offset, offset + byteLength);

			byteOrder = overrideByteOrder ?? byteOrder;

			if (byteLength > 1 && !byteOrder) {
				throw new DecodeError(errorMessage.noByteOrder(byteLength), source);
			}

			if (source.length !== byteLength) {
				throw new DecodeError(errorMessage.unexpectedBufferEnd(byteLength, offset), source);
			}

			let uint = 0n;

			for (let i = 0; i < byteLength; i++) {
				const index = byteOrder === ByteOrder.LittleEndian ? i : byteLength - i - 1;
				uint += BigInt(source[index]!) << BigInt(i * 8);
			}

			return {
				value: signed ? BigInt.asIntN(byteLength * 8, uint) : uint,
				source,
			};
		},
	} as const satisfies DecoderObject<bigint>;
};

export const BigUint64Decoder = bigintDecoder({ signed: false, byteLength: 8, });
export const BigInt64Decoder = bigintDecoder({ signed: true, byteLength: 8, });
