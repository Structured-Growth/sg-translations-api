import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface ClientCreateDynamicTranslateBodyInterface {
	orgId: number;
	region: RegionEnum;
	translator: string;
	locales: string[];
}