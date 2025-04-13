export function asyncBuffer(source: Uint8Array, bufferSize: number) {
	let offset = 0;

	return {
		seek: (position: number) => {
			offset = position;
			return {
				buffer: source.subarray(offset, offset + bufferSize),
				offset: 0,
			};
		},
		queryState: async (byteLength: number) => {
			offset += byteLength;
			return {
				buffer: source.subarray(offset, offset + bufferSize),
				offset: 0,
			};
		},
	};
}
