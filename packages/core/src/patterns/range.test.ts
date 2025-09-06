import assert from "node:assert/strict";
import { suite as group, test } from "node:test";

import { rangePattern } from "./range.ts";

group("range", () => {
	test("(4,a)", () => {
		const validate = rangePattern("(4,a)");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i <= 0xff; i++) {
			if (i > 0x04 && i < 0x0a) {
				assert(validate(i, backReferences));
			} else {
				assert(!validate(i, backReferences));
			}
		}
	});

	test("(4,a]", () => {
		const validate = rangePattern("(4,a]");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i <= 0xff; i++) {
			if (i > 0x04 && i <= 0x0a) {
				assert(validate(i, backReferences));
			} else {
				assert(!validate(i, backReferences));
			}
		}
	});

	test("[4,a)", () => {
		const validate = rangePattern("[4,a)");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i <= 0xff; i++) {
			if (i >= 0x04 && i < 0x0a) {
				assert(validate(i, backReferences));
			} else {
				assert(!validate(i, backReferences));
			}
		}
	});

	test("[4,a]", () => {
		const validate = rangePattern("[4,a]");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i <= 0xff; i++) {
			if (i >= 0x04 && i <= 0x0a) {
				assert(validate(i, backReferences));
			} else {
				assert(!validate(i, backReferences));
			}
		}
	});
});
