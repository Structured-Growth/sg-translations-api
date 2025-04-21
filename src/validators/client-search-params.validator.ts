import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const ClientSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.clients.orgId"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived")).label("validator.clients.status"),
			title: joi.array().items(joi.string().max(100)).label("validator.clients.title"),
			clientName: joi.array().items(joi.string().max(100)).label("validator.clients.clientName"),
			locales: joi.array().items(joi.string().max(15)).label("validator.clients.locales"),
			defaultLocale: joi.array().items(joi.string().max(15)).label("validator.clients.defaultLocale"),
		})
		.concat(CommonSearchParamsValidator),
});
