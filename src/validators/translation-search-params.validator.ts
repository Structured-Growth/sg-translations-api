import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const TranslationSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.translations.orgId"),
			tokenId: joi.array().items(joi.number().positive()).label("validator.translations.tokenId"),
			clientId: joi.number().positive().required().label("validator.translations.clientId"),
			locales: joi.array().items(joi.string().max(15)).label("validator.translations.locales"),
		})
		.concat(CommonSearchParamsValidator),
});
