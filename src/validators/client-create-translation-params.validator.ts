import { joi } from "@structured-growth/microservice-sdk";

export const ClientCreateTranslationParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
	query: joi.object(),
	body: joi.object({
		locale: joi.string().max(15).required().label("Locale"),
		data: joi.object().min(1).required().label("Translate JSON schema"),
	}),
});
