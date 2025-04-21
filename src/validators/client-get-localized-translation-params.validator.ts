import { joi } from "@structured-growth/microservice-sdk";

export const ClientGetLocalizedTranslationParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("validator.translationsSet.clientId"),
	locale: joi.string().max(15).required().label("validator.translationsSet.locale"),
	query: joi.object({
		format: joi.string().valid("dot", "nested").label("validator.translationsSet.format"),
	}),
});
