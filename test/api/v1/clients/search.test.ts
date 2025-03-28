import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createClient } from "../../../common/create-client";

describe("GET /api/v1/clients", () => {
	const { server, context } = initTest();

	createClient(server, context, {
		orgId: Math.floor(Math.random() * 100) + 1,
		region: "us",
		status: "active",
		title: `TestClientName-${Date.now()}`,
		clientName: `TestClientName-${Date.now()}`.toLowerCase(),
		locales: ["us-En", "pt-Pt"],
		contextPath: "client",
		defaultLocale: "us-En",
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

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/clients").query({
			"id[0]": -1,
			orgId: "a",
			page: 0,
			limit: false,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.query.id[0][0]);
		assert.isString(body.validation.query.orgId[0]);
	});
});
