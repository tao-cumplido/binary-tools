import { suite as group } from "node:test";

group("datatypes", () => {
	group("bigint", async () => {
		await import("./bigint/decode.test.ts");
		await import("./bigint/encode.test.ts");
	});

	group("float", async () => {
		await import("./float/decode.test.ts");
	});

	group("char", () => {
		group("ascii", async () => {
			await import("./char/ascii/decode.test.ts");
		});
		group("iso-8859-1", async () => {
			await import("./char/iso-8859-1/decode.test.ts");
		});
		group("utf-8", async () => {
			await import("./char/utf-8/decode.test.ts");
		});
		group("utf-16", async () => {
			await import("./char/utf-16/decode.test.ts");
		});
		group("utf-32", async () => {
			await import("./char/utf-32/decode.test.ts");
		});
	});

	group("bytes", async () => {
		await import("./bytes/decode.test.ts");
	});

	group("array", async () => {
		await import("./array/decode.test.ts");
	});

	group("string", async () => {
		await import("./string/decode.test.ts");
	});
});
