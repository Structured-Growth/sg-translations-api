import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createClient } from "../../../common/create-client";

describe("GET /api/v1/clients/:clientId", () => {
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

	it("Should read client", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/${context.client.id}`).send({});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.client.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
	});

	it("Should return is client does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/999999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/mainaccount`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
