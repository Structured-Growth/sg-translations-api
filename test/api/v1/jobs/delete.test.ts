import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { Client } from "../../../../database/models/client";
import { Job } from "../../../../database/models/job";
import { RegionEnum } from "@structured-growth/microservice-sdk";

describe("DELETE /api/v1/jobs/:jobId", () => {
	const { server, context } = initTest();
	let createdClientId: number;
	let createdJobId: number;

	before(async () => {
		const createdClient = await Client.create({
			orgId: 2,
			region: RegionEnum.US,
			status: "active",
			title: `TestClientName-${Date.now()}`,
			clientName: `TestClientName-${Date.now()}`.toLowerCase(),
			locales: ["us-En", "pt-Pt"],
		});

		createdClientId = createdClient.id;

		const createdJob = await Job.create({
			orgId: 2,
			region: RegionEnum.US,
			clientId: createdClientId,
			translator: "Test Translator",
			status: "in_progress",
			locales: ["en-US", "fr-FR"],
			numberTokens: 100,
			numberTranslations: 0,
			launchType: "admin",
		});

		createdJobId = createdJob.id;
	});

	after(async () => {
		await Client.destroy({ where: { id: createdClientId } });
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
