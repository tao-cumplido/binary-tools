export async function repeat<T>(times: number, callback: (index: number) => T | Promise<T>): Promise<T[]> {
	const result = new Array<T>(times);

	for (let i = 0; i < times; i++) {
		result[i] = await callback(i);
	}

	return result;
}
