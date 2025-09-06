export class DecodeError extends Error {
	readonly bytes: Uint8Array;

	constructor(message: string, bytes: Uint8Array = new Uint8Array()) {
		super(message);
		this.bytes = bytes;
	}
}

export class EncodeError<T> extends Error {
	readonly value: T;

	constructor(message: string, value: T) {
		super(message);
		this.value = value;
	}
}
