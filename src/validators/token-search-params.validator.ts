import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const TokenSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("Organization Id"),
			token: joi.string().max(255).label("Token"),
			clientId: joi.number().positive().label("Client Id"),
		})
		.concat(CommonSearchParamsValidator),
});