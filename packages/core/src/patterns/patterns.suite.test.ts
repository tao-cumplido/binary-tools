import { suite as group } from "node:test";

group("patterns", async () => {
	await import("./backreference.test.ts");
	await import("./range.test.ts");
	await import("./wildcard.test.ts");
});
