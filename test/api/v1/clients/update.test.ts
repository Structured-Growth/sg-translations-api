import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createClient} from "../../../common/create-client";

describe("PUT /api/v1/clients/:clientId", () => {
	const { server, context } = initTest();

	createClient(server, context, {
		orgId: Math.floor(Math.random() * 100) + 1,
		region: "us",
		status: "active",
		title: `TestClientName-${Date.now()}`,
		clientName: `TestClientName-${Date.now()}`.toLowerCase(),
		locales: ["us-En", "pt-Pt"],
		contextPath: "client",
	});

	it("Should update client", async () => {
		const { statusCode, body } = await server.put(`/v1/clients/${context.client.id}`).send({
			status: "archived",
		});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "archived");
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/clients/${context.client.id}`).send({
			status: "deleted",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/clients/9999`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});