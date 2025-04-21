import { joi } from "@structured-growth/microservice-sdk";

export const ClientCreateDynamicTranslateParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("validator.translationsSet.clientId"),
	query: joi.object(),
	body: joi.object({
		translator: joi.string().valid("aws-translate").required().label("validator.translationsSet.translator"),
		locales: joi.array().items(joi.string().max(15)).required().label("validator.translationsSet.locales"),
	}),
});
