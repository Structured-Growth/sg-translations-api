import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createClient } from "../../../common/create-client";
import { seedClientCustomFields } from "../../../common/seed-custom-fields";

describe("GET /api/v1/clients", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 100) + 1;

	before(() => seedClientCustomFields(orgId));

	createClient(server, context, {
		orgId,
		region: "us",
		status: "active",
		title: `TestClientName-${Date.now()}`,
		clientName: `TestClientName-${Date.now()}`.toLowerCase(),
		locales: ["us-En", "pt-Pt"],
		contextPath: "client",
		defaultLocale: "us-En",
		metadata: {
			billingCode: "AA",
		},
	});

	it("Should return 0 clients", async () => {
		const { statusCode, body } = await server.get("/v1/clients").query({
			orgId: 999999,
		});
		assert.equal(statusCode, 200);
	});

	it("Should return client", async () => {
		const { statusCode, body } = await server.get("/v1/clients").query({
			"id[0]": context.client.id,
			orgId: context.client.orgId,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.client.id);
		assert.equal(body.data[0].orgId, context.client.orgId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.isString(body.data[0].status);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return client filtered by metadata", async () => {
		const { statusCode, body } = await server.get("/v1/clients").query({
			orgId: context.client.orgId,
			metadata: {
				billingCode: "AA",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.client.id);
		assert.equal(body.data[0].metadata.billingCode, "AA");
	});

	it("Should return client filtered by numeric metadata", async () => {
		const uniqueName = `client-${Date.now()}`;
		const { statusCode: createStatusCode, body: createdClient } = await server.post("/v1/clients").send({
			orgId,
			region: "us",
			status: "active",
			title: uniqueName,
			clientName: uniqueName,
			locales: ["us-En", "pt-Pt"],
			defaultLocale: "us-En",
			metadata: {
				billingCode: 10,
			},
		});

		assert.equal(createStatusCode, 201);

		const { statusCode, body } = await server.get("/v1/clients").query({
			orgId: createdClient.orgId,
			metadata: {
				billingCode: 10,
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, createdClient.id);
		assert.equal(body.data[0].metadata.billingCode, 10);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/clients").query({
			"id[0]": "bad",
			orgId: "a",
			title: null,
			clientName: null,
			locales: false,
			defaultLocale: false,
			metadata: "bad",
			arn: 1,
			page: "b",
			limit: false,
			"status[0]": "superstatus",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0][0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.title[0]);
		assert.isString(body.validation.query.clientName[0]);
		assert.isString(body.validation.query.locales[0]);
		assert.isString(body.validation.query.defaultLocale[0]);
		assert.isString(body.validation.query.metadata[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.page[0]);
		assert.isString(body.validation.query.limit[0]);
		assert.isString(body.validation.query.status[0][0]);
	});
});
