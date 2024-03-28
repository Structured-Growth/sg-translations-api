export default function flattenObjectKeys (obj: object, prefix: string = ''): { [key: string]: string }[] {
	const jsonTokens: { [key: string]: string }[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'object') {
			const nestedTokens = flattenObjectKeys(value, prefix ? `${prefix}.${key}` : key);
			jsonTokens.push(...nestedTokens);
		} else {
			jsonTokens.push({ [prefix ? `${prefix}.${key}` : key]: value });
		}
	}

	return jsonTokens;
}