import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface ClientSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	status?: string[];
	clientName?: string[];
	locales?: string[];
}