import { ClientAttributes } from "../../database/models/client";

export interface ClientUpdateBodyInterface {
	status?: ClientAttributes["status"];
	locales?: ClientAttributes["locales"];
}