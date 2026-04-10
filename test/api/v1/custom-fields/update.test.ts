import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { customFieldAlternativesSchema } from "../../../common/custom-field-schema";

describe("PUT /api/v1/custom-fields/:customFieldId", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	it("Should create custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId,
			entity: "Client",
			title: "Billing Code",
			name: "billingCode",
			schema: customFieldAlternativesSchema,
			status: "active",
		});

		assert.equal(statusCode, 201);
		context.customFieldId = body.id;
	});

	it("Should update custom field", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			entity: "Client",
			title: "Billing Source",
			name: "billingSource",
			schema: customFieldAlternativesSchema,
			status: "inactive",
		});

		assert.equal(statusCode, 200);
		assert.equal(body.id, context.customFieldId);
		assert.equal(body.entity, "Client");
		assert.equal(body.title, "Billing Source");
		assert.equal(body.name, "billingSource");
		assert.equal(body.schema.type, "alternatives");
		assert.equal(body.status, "inactive");
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			title: 1,
			name: 2,
			schema: "bad",
			status: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.name[0]);
		assert.isString(body.validation.body.schema[0]);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error for invalid name characters", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			name: "billing source!",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.name[0]);
	});

	it("Should return validation error for duplicate custom field", async () => {
		const { statusCode: createStatusCode, body: createBody } = await server.post("/v1/custom-fields").send({
			orgId,
			entity: "Client",
			title: "Billing Code 2",
			name: "billingCode2",
			schema: customFieldAlternativesSchema,
			status: "active",
		});

		assert.equal(createStatusCode, 201);

		const { statusCode, body } = await server.put(`/v1/custom-fields/${createBody.id}`).send({
			name: "billingSource",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.name[0]);
	});
});
