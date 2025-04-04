import { ClientAttributes } from "../../database/models/client";

export interface ClientUpdateBodyInterface {
	status?: ClientAttributes["status"];
	title?: string;
	clientName?: string;
	locales?: ClientAttributes["locales"];
	defaultLocale?: string;
}
