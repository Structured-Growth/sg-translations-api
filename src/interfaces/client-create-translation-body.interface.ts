import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface ClientCreateTranslationBodyInterface {
	orgId: number;
	region: RegionEnum;
	locale: string;
	data: { [key: string]: any };
}
