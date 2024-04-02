import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface TokenSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	clientId: number;
	token?: string;
}
