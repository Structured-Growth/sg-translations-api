import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { JobAttributes } from "../../database/models/job";

export interface JobSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	clientId?: number;
	translator?: string[];
	status?: JobAttributes["status"][];
	locales?: string[];
	launchType?: JobAttributes["launchType"][];
}