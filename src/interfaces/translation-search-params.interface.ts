import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { TranslationAttributes } from "../../database/models/translation";

export interface TranslationSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	clientId: number;
	tokenId?: number[];
	locales?: string[];
}
