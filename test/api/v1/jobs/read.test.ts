import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/jobs/:jobId", () => {
	const { server, context } = initTest();

	it("Should read job", async () => {
		const { statusCode, body } = await server.get(`/v1/jobs/12`).send({});
		assert.equal(statusCode, 200);
		assert.equal(body.id, 12);
		assert.isNumber(body.orgId);
		assert.isNumber(body.clientId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.isString(body.status);
		assert.isString(body.arn);
		assert.isString(body.region);
		assert.isString(body.translator);
		assert.isString(body.locales[0]);
		assert.isString(body.launchType);
		assert.isNumber(body.numberTokens);
		assert.isNumber(body.numberTranslations);
	});

	it("Should return is job does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/jobs/999999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/jobs/mainaccount`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});