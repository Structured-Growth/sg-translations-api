import { JobAttributes } from "../../database/models/job";

export interface JobUpdateBodyInterface {
	status?: JobAttributes["status"];
}
