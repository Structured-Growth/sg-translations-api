import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const JobSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("validator.jobs.orgId"),
			clientId: joi.number().positive().label("validator.jobs.clientId"),
			translator: joi.array().items(joi.string().max(20)).label("validator.jobs.translator"),
			status: joi.array().items(joi.string().valid("completed", "inProgress", "error")).label("validator.jobs.status"),
			locales: joi.array().items(joi.string().max(15).label("validator.jobs.locales")),
			clientName: joi.string().max(100).label("validator.jobs.clientName"),
			launchType: joi.array().items(joi.string().valid("admin", "git")).label("validator.jobs.launchType"),
		})
		.concat(CommonSearchParamsValidator),
});
