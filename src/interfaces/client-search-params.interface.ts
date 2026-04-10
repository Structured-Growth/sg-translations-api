import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface ClientSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	status?: string[];
	title?: string[];
	clientName?: string[];
	locales?: string[];
	defaultLocale?: string[];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[billingCode]=AA
	 */
	"metadata[customFieldName]"?: string;
}
