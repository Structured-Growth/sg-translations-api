import { joi, RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";

export async function seedClientCustomFields(orgId: number): Promise<void> {
	await CustomField.create({
		orgId,
		region: RegionEnum.US,
		entity: "Client",
		title: "Billing Code",
		name: "billingCode",
		schema: joi.string().min(2).describe(),
		status: "active",
	});
}
