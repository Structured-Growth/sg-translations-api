import { joi } from "@structured-growth/microservice-sdk";

export const TokenReadParamsValidator = joi.object({
	tokenId: joi.number().positive().required().label("validator.tokens.tokenId"),
});
