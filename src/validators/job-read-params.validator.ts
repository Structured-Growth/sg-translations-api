import { joi } from "@structured-growth/microservice-sdk";

export const JobReadParamsValidator = joi.object({
	jobId: joi.number().positive().required().label("Job Id"),
});