import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const JobSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("Organization Id"),
			clientId: joi.number().positive().label("Client Id"),
			translator: joi.array().items(joi.string().max(20)).label("Status"),
			status: joi.array().items(joi.string().valid("completed", "inProgress", "error")).label("Status"),
			locales: joi.array().items(joi.string().max(15).label("Locales")),
			clientName: joi.string().max(100).label("Client Name"),
			launchType: joi.array().items(joi.string().valid("admin", "git")).label("Launch type"),
		})
		.concat(CommonSearchParamsValidator),
});
