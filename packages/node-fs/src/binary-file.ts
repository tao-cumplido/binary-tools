import type { FileHandle } from "node:fs/promises";
import { fstatSync } from "node:fs";

import { BinaryData, ByteOrder, type BinaryDataConfig } from "@binary-tools/core";

export * from "@binary-tools/core";

export class BinaryFile extends BinaryData {
	#fileHandle: FileHandle;

	get fileHandle(): FileHandle {
		return this.#fileHandle;
	}

	constructor(fileHandle: FileHandle, { bufferSize, }: BinaryDataConfig);
	constructor(fileHandle: FileHandle, byteOrder?: ByteOrder, config?: BinaryDataConfig);
	constructor(fileHandle: FileHandle, byteOrderOrConfig?: ByteOrder | BinaryDataConfig, config?: BinaryDataConfig) {
		const byteOrder = byteOrderOrConfig instanceof ByteOrder ? byteOrderOrConfig : undefined;
		const resolvedConfig = byteOrderOrConfig instanceof ByteOrder ? config : byteOrderOrConfig;

		super(
			fstatSync(fileHandle.fd).size,
			async ({ offset, byteLength, }) => {
				const buffer = new Uint8Array(byteLength);
				const { bytesRead, } = await fileHandle.read(buffer, 0, byteLength, offset);
				return buffer.subarray(0, bytesRead);
			},
			byteOrder,
			resolvedConfig,
		);

		this.#fileHandle = fileHandle;
	}

	async close(): Promise<void> {
		await this.#fileHandle.close();
	}

	async [Symbol.asyncDispose](): Promise<void> {
		await this.close();
	}
}
