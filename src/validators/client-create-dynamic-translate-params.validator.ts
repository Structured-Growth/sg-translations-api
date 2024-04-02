import { joi } from "@structured-growth/microservice-sdk";

export const ClientCreateDynamicTranslateParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
	query: joi.object(),
	body: joi.object({
		translator: joi.string().valid("aws-translate").required().label("Translator"),
		locales: joi.array().items(joi.string().max(15)).required().label("Locales"),
	}),
});
