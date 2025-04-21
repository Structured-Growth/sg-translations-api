import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const TokenSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.tokens.orgId"),
			clientId: joi.number().positive().required().label("validator.tokens.clientId"),
			token: joi.string().max(255).label("validator.tokens.token"),
		})
		.concat(CommonSearchParamsValidator),
});
