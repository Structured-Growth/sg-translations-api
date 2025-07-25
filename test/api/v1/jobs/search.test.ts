import "../../../../src/app/providers";
import { assert } from "chai";
import { Client } from "../../../../database/models/client";
import { Job } from "../../../../database/models/job";
import { initTest } from "../../../common/init-test";
import { RegionEnum } from "@structured-growth/microservice-sdk";

describe("GET /api/v1/jobs", () => {
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

	it("Should return 0 jobs", async () => {
		const { statusCode, body } = await server.get("/v1/jobs").query({
			orgId: 999999,
		});
		assert.equal(statusCode, 200);
	});

	it("Should return job", async () => {
		const { statusCode, body } = await server.get("/v1/jobs").query({
			"id[0]": createdJobId,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, createdJobId);
		assert.isNumber(body.data[0].orgId);
		assert.isNumber(body.data[0].clientId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.isString(body.data[0].status);
		assert.isString(body.data[0].arn);
		assert.isString(body.data[0].region);
		assert.isString(body.data[0].translator);
		assert.isString(body.data[0].locales[0]);
		assert.isString(body.data[0].launchType);
		assert.isNumber(body.data[0].numberTokens);
		assert.isNumber(body.data[0].numberTranslations);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/jobs").query({
			"id[0]": -1,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.query.id[0][0]);
	});
});
