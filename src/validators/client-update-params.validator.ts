import { joi } from "@structured-growth/microservice-sdk";

export const ClientUpdateParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		title: joi.string().max(100).label("Title"),
		clientName: joi.string().max(100).label("Client Name"),
		locales: joi.array().items(joi.string().max(15).label("Locales")),
		defaultLocale: joi.string().max(15).label("Default locale"),
	}),
});
