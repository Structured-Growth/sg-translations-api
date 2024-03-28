export default function findDifference(
	newArray: string[],
	oldArray: { token: string; id: number }[]
): { newTokens: string[]; oldTokens: number[]; commonTokens: { token: string; id: number }[] } {
	let newTokens: string[] = [];
	let oldTokens: number[] = [];
	let commonTokens: { token: string; id: number }[] = [];

	const oldTokensSet = oldArray.map(item => item.token);

	for (let i = 0; i < newArray.length; i++) {
		if (!oldTokensSet.includes(newArray[i])) {
			newTokens.push(newArray[i]);
		}
	}

	for (let i = 0; i < oldArray.length; i++) {
		if (!newArray.includes(oldArray[i].token)) {
			oldTokens.push(oldArray[i].id);
		} else {
			commonTokens.push({token: oldArray[i].token, id: oldArray[i].id});
		}
	}

	return { newTokens, oldTokens, commonTokens };
}


