import test from "node:test";

test.describe("datatypes", () => {
	test.describe("bigint", async () => {
		await import("./bigint/decode.test.js");
		await import("./bigint/encode.test.js");
	});

	test.describe("float", async () => {
		await import("./float/decode.test.js");
	});

	test.describe("char", () => {
		test.describe("ascii", async () => {
			await import("./char/ascii/decode.test.js");
		});
		test.describe("iso-8859-1", async () => {
			await import("./char/iso-8859-1/decode.test.js");
		});
		test.describe("utf-8", async () => {
			await import("./char/utf-8/decode.test.js");
		});
		test.describe("utf-16", async () => {
			await import("./char/utf-16/decode.test.js");
		});
		test.describe("utf-32", async () => {
			await import("./char/utf-32/decode.test.js");
		});
	});

	test.describe("bytes", async () => {
		await import("./bytes/decode.test.js");
	});

	test.describe("array", async () => {
		await import("./array/decode.test.js");
	});

	test.describe("string", async () => {
		await import("./string/decode.test.js");
	});
});
