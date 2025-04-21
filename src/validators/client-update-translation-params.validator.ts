import { joi } from "@structured-growth/microservice-sdk";

export const ClientUpdateTranslationParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("validator.translationsSet.clientId"),
	query: joi.object(),
	body: joi.object({
		locale: joi.string().max(15).required().label("validator.translationsSet.locale"),
		data: joi.object().min(1).required().label("validator.translationsSet.data"),
	}),
});
