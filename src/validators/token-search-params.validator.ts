import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const TokenSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			clientId: joi.number().positive().required().label("Client Id"),
			token: joi.string().max(255).label("Token"),
		})
		.concat(CommonSearchParamsValidator),
});
