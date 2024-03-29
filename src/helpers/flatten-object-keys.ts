export default function flattenObjectKeys(obj: object, prefix: string = ""): { [key: string]: string } {
	const flattenedObject: { [key: string]: string } = {};

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === "object") {
			const nestedKeys = flattenObjectKeys(value, prefix ? `${prefix}.${key}` : key);
			Object.assign(flattenedObject, nestedKeys);
		} else {
			flattenedObject[prefix ? `${prefix}.${key}` : key] = value;
		}
	}

	return flattenedObject;
}
