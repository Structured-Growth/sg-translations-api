import { joi } from "@structured-growth/microservice-sdk";

export const JobDeleteParamsValidator = joi.object({
	jobId: joi.number().positive().required().label("Job Id"),
});
