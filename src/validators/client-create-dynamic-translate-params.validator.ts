import { joi } from "@structured-growth/microservice-sdk";

export const ClientCreateDynamicTranslateParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		region: joi.string().max(15).required().label("Region"),
		translator: joi.string().max(15).required().label("Translator"),
		locales: joi.array().items(joi.string().max(15)).required().label("Locales"),
	}),
});