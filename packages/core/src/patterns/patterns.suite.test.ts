import test from "node:test";

test.describe("patterns", async () => {
	await import("./backreference.test.js");
	await import("./range.test.js");
	await import("./wildcard.test.js");
});
