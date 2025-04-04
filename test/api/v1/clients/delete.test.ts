import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createClient } from "../../../common/create-client";

describe("DELETE /api/v1/clients/:clientId", () => {
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

	it("Should delete client", async () => {
		const { statusCode, body } = await server.delete(`/v1/clients/${context.client.id}`);
		assert.equal(statusCode, 204);
	});

	it("Should return is client does not exist and delete was successful", async () => {
		const { statusCode, body } = await server.delete(`/v1/clients/${context.client.id}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/clients/mainclient`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
