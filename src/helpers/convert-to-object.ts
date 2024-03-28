export default function convertToObject(obj: { [key: string]: string }) {
	const result: object = {};
	for (const key in obj) {
		const keys = key.split('.');
		let nested = result;
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (i === keys.length - 1) {
				nested[k] = obj[key];
			} else {
				nested[k] = nested[k] || {};
				nested = nested[k];
			}
		}
	}
	return result;
}