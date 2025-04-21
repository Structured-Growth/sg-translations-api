import { joi } from "@structured-growth/microservice-sdk";

export const ClientReadParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("validator.clients.clientId"),
});
