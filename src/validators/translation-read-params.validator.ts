import { joi } from "@structured-growth/microservice-sdk";

export const TranslationReadParamsValidator = joi.object({
	translationId: joi.number().positive().required().label("validator.translations.translationId"),
});
