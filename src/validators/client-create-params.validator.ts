import { joi } from "@structured-growth/microservice-sdk";

export const ClientCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		region: joi.string().min(2).required().label("Organization region"),
		status: joi.string().valid("active", "inactive").required().label("Status"),
		clientName: joi.string().max(100).required().label("Client Name"),
		title: joi.string().max(100).required().label("Client Name"),
		locales: joi.array().items(joi.string().max(15)).required().label("Locales"),
		defaultLocale: joi.string().max(15).required().label("Default locale"),
	}),
});
