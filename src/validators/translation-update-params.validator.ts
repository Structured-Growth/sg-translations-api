import { joi } from "@structured-growth/microservice-sdk";

export const TranslationUpdateParamsValidator = joi.object({
	translationId: joi.number().positive().required().label("Client Id"),
	query: joi.object(),
	body: joi.object({
		text: joi.string().required().label("Text"),
	}),
});
