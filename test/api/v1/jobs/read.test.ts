import "../../../../src/app/providers";
import { assert } from "chai";
import { Client } from "../../../../database/models/client";
import { Job } from "../../../../database/models/job";
import { initTest } from "../../../common/init-test";
import { RegionEnum } from "@structured-growth/microservice-sdk";

describe("GET /api/v1/jobs/:jobId", () => {
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
			defaultLocale: "us-En",
		});

		createdClientId = createdClient.id;

		const createdJob = await Job.create({
			orgId: 2,
			region: RegionEnum.US,
			clientId: createdClientId,
			translator: "aws",
			status: "in_progress",
			locales: ["en-US"],
			launchType: "admin",
			numberTokens: 48,
			numberTranslations: 96,
		});

		createdJobId = createdJob.id;
	});

	after(async () => {
		await Job.destroy({ where: { id: createdJobId } });
		await Client.destroy({ where: { id: createdClientId } });
	});

	it("Should read job", async () => {
		const { statusCode, body } = await server.get(`/v1/jobs/${createdJobId}`).send({});
		assert.equal(statusCode, 200);
		assert.equal(body.id, createdJobId);
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
