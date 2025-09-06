import type { ByteValidator, Pattern } from "./shared.ts";

const registry = new Set<Pattern>();
const cache = new Map<string, ByteValidator>();

export function registerPatterns(patterns: readonly Pattern[]) {
	for (const pattern of patterns) {
		registry.add(pattern);
	}
}

export class MatchError extends Error {
	readonly invalidPattern: string;

	constructor(pattern: string) {
		super(`Invalid pattern "${pattern}"`);
		this.invalidPattern = pattern;
	}
}

export function matchPattern(pattern: string) {
	const cached = cache.get(pattern);

	if (cached) {
		return cached;
	}

	for (const validate of registry) {
		const match = validate(pattern);

		if (match) {
			cache.set(pattern, match);
			return match;
		}
	}

	throw new MatchError(pattern);
}
