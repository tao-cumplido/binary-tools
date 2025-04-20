export async function repeat<T>(times: number | Promise<number>, callback: (index: number) => T | Promise<T>): Promise<T[]> {
	const resolvedTimes = await times;
	const result = new Array<T>(resolvedTimes);

	for (let i = 0; i < resolvedTimes; i++) {
		result[i] = await callback(i);
	}

	return result;
}
