import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { TranslationAttributes } from "../../database/models/translation";

export interface TranslationSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	tokensId?: number[];
	clientId?: number;
	locales?: string[];
}
