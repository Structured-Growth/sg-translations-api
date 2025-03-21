import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const TranslationSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			tokenId: joi.array().items(joi.number().positive()).label("Token Id"),
			clientId: joi.number().positive().required().label("Client Id"),
			locales: joi.array().items(joi.string().max(15)).label("Locale"),
		})
		.concat(CommonSearchParamsValidator),
});
