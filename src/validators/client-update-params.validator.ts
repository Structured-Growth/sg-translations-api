import { joi } from "@structured-growth/microservice-sdk";

export const ClientUpdateParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("validator.clients.clientId"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("validator.clients.status"),
		title: joi.string().max(100).label("validator.clients.title"),
		clientName: joi.string().max(100).label("validator.clients.clientName"),
		locales: joi.array().items(joi.string().max(15).label("validator.clients.locales")),
		defaultLocale: joi.string().max(15).label("validator.clients.defaultLocale"),
	}),
});
