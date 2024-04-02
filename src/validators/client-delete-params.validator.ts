import { joi } from "@structured-growth/microservice-sdk";

export const ClientDeleteParamsValidator = joi.object({
	clientId: joi.number().positive().required().label("Client Id"),
});
