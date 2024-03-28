import { joi } from "@structured-growth/microservice-sdk";

export const ClientGetLocalizedTranslationParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
	locale: joi.string().max(15).required().label("Locale")
});