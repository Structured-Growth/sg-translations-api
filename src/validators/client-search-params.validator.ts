import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const ClientSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived")).label("Status"),
			title: joi.array().items(joi.string().max(100)).label("Title"),
			clientName: joi.array().items(joi.string().max(100)).label("Client Name"),
			locales: joi.array().items(joi.string().max(15)).label("Locales"),
		})
		.concat(CommonSearchParamsValidator),
});
