import { joi } from "@structured-growth/microservice-sdk";

export const ClientUpdateParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		locales: joi.array().items(joi.string().max(15).label("Locales")),
	}),
});