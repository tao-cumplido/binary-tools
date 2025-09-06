import assert from "node:assert/strict";
import { suite as group, test } from "node:test";

import { wildcardPattern } from "./wildcard.ts";

group("wildcard", () => {
	test("??", () => {
		const validate = wildcardPattern("??");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i <= 0xff; i++) {
			assert(validate(i, backReferences));
		}
	});

	test("?0", () => {
		const validate = wildcardPattern("?0");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i <= 0xff; i++) {
			if (i % 0x10) {
				assert(!validate(i, backReferences));
			} else {
				assert(validate(i, backReferences));
			}
		}
	});

	test("0?", () => {
		const validate = wildcardPattern("0?");

		assert(validate);

		const backReferences = new Uint8Array();

		for (let i = 0x00; i < 0x10; i++) {
			assert(validate(i, backReferences));
		}

		for (let i = 0x10; i <= 0xff; i++) {
			assert(!validate(i, backReferences));
		}
	});

	test("00", () => {
		const validate = wildcardPattern("00");

		assert(validate);

		const backReferences = new Uint8Array();

		assert(validate(0x00, backReferences));

		for (let i = 0x01; i <= 0xff; i++) {
			assert(!validate(i, backReferences));
		}
	});
});
