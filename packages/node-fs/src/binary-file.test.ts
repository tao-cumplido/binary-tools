import assert from "node:assert/strict";
import { mock, suite as group, test } from "node:test";

import { createFixture } from "@shigen/test/fs";

import { string, BinaryFile, CharUtf8 } from "./binary-file.ts";

group("BinaryFile", () => {
	test("read file", async () => {
		const textEncoder = new TextEncoder();

		await using fixture = await createFixture({
			"test": textEncoder.encode("こんにちは"),
		});

		const handle = await fixture.fs.open("test");
		const readSpy = mock.method(handle, "read");

		const file = new BinaryFile(handle, { bufferSize: 5, });

		assert.equal(await file.read(string(CharUtf8)), "こんにちは");

		// each kana is 3 bytes
		assert.equal(readSpy.mock.callCount(), 6);
		assert.equal((await readSpy.mock.calls[0]?.result)?.bytesRead, 5);
		assert.equal((await readSpy.mock.calls[4]?.result)?.bytesRead, 3);
		assert.equal((await readSpy.mock.calls[5]?.result)?.bytesRead, 0);
	});
});
