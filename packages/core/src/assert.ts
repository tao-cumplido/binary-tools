import type { Simplify } from "type-fest";

export type AssertMessage = {
	readonly message?: string;
};

export type Range = {
	readonly min?: number;
	readonly max?: number;
};

export type AssertIntRange = Simplify<AssertMessage & Range>;

export type AssertIntValues = Simplify<AssertMessage & {
	readonly values: readonly number[];
}>;

export function assertInt(value: unknown, options: AssertIntValues): asserts value is number;
export function assertInt(value: unknown, options?: AssertIntRange): asserts value is number;
export function assertInt(
	value: unknown,
	{
		min = -Infinity,
		max = Infinity,
		values = [],
		message = `expected integer in ${values.length ? `[${values.join(", ")}]` : `range [${min}, ${max}]`}, got ${value}`,
	}: Partial<AssertIntRange & AssertIntValues> = {},
): asserts value is number {
	const check = () => {
		if (typeof value !== "number" || !Number.isInteger(value)) {
			return false;
		}

		if (values.length) {
			return values.includes(value);
		}

		return value >= min && value <= max;
	};

	if (!check()) {
		throw new TypeError(message);
	}
}
