import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface TranslationCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	tokenId: number;
	clientId: number;
	locale: string;
	text: string;
}
