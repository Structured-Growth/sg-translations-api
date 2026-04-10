import { RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";
import { customFieldAlternativesSchema } from "./custom-field-schema";

export async function seedClientCustomFields(orgId: number): Promise<void> {
	await CustomField.create({
		orgId,
		region: RegionEnum.US,
		entity: "Client",
		title: "Billing Code",
		name: "billingCode",
		schema: customFieldAlternativesSchema,
		status: "active",
	});
}
