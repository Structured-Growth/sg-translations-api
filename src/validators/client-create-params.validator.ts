import { joi } from "@structured-growth/microservice-sdk";

export const ClientCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.clients.orgId"),
		region: joi.string().min(2).required().label("validator.clients.region"),
		status: joi.string().valid("active", "inactive").required().label("validator.clients.status"),
		clientName: joi.string().max(100).required().label("validator.clients.clientName"),
		title: joi.string().max(100).required().label("validator.clients.title"),
		locales: joi.array().items(joi.string().max(15)).required().label("validator.clients.locales"),
		defaultLocale: joi.string().max(15).required().label("validator.clients.defaultLocale"),
	}),
});
