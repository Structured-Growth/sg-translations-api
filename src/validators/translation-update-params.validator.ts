import { joi } from "@structured-growth/microservice-sdk";

export const TranslationUpdateParamsValidator = joi.object({
	translationId: joi.number().positive().required().label("validator.translations.translationId"),
	query: joi.object(),
	body: joi.object({
		text: joi.string().required().label("validator.translations.text"),
		metadata: joi.object().label("validator.translations.metadata"),
	}),
});
