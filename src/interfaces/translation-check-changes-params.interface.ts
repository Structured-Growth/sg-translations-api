export interface TranslationCheckParamsInterface {
	orgId?: number;
	clientId?: number;
	locales?: string[];
	commonTokens?: { token: string; id: number }[];
	jsonTokens?: { [key: string]: string };
}
