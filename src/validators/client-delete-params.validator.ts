import { joi } from "@structured-growth/microservice-sdk";

export const ClientDeleteParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("validator.clients.clientId"),
});
