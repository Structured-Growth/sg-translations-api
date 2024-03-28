import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface TokenCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	token: string;
	clientId: number;
}