import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface ClientCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	status: "active" | "inactive";
	title: string;
	clientName: string;
	locales: string[];
}