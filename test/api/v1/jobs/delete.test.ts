import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { Job } from "../../../../database/models/job";
import { RegionEnum } from "@structured-growth/microservice-sdk";


describe("DELETE /api/v1/jobs/:jobId", () => {
	const { server, context } = initTest();
	let createdJobId: number;

	before(async () => {
		const createdJob = await Job.create({
			orgId: 2,
			region: RegionEnum.US,
			clientId: 2,
			translator: "Test Translator",
			status: "inProgress",
			locales: ["en-US", "fr-FR"],
			numberTokens: 100,
			numberTranslations: 0,
			launchType: "admin"
		});

		createdJobId = createdJob.id;
	});

	it("Should delete job", async () => {
		const { statusCode, body } = await server.delete(`/v1/jobs/${createdJobId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return is job does not exist and delete was successful", async () => {
		const { statusCode, body } = await server.delete(`/v1/jobs/2`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/jobs/mainclient`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});