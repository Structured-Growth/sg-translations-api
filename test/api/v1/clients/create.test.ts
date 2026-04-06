import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedClientCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/clients", () => {
	const { server, context } = initTest();

	const region = "us";
	const status = "active";
	const randomTitle = `TestClientName-${Date.now()}`;
	const clientName = randomTitle.toLowerCase();
	const locales = ["en-US", "pt-PT"];
	const defaultLocale = "en-US";
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedClientCustomFields(orgId);
	});

	it("Should create client", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId,
			region,
			status,
			title: randomTitle,
			clientName,
			locales,
			defaultLocale,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, status);
		assert.isString(body.arn);
		assert.equal(body.orgId, orgId);
		assert.equal(body.region, region);
		assert.equal(body.title, randomTitle);
		assert.equal(body.clientName, clientName);
		assert.deepStrictEqual(body.locales, locales);
		assert.deepStrictEqual(body.metadata, {});
	});

	it("Should create client with metadata", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId,
			region,
			status,
			title: `${randomTitle}-metadata`,
			clientName: `${clientName}-metadata`,
			locales,
			defaultLocale,
			metadata: {
				billingCode: "AA",
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.metadata.billingCode, "AA");
	});

	it("Should return Joi validation error for invalid request body", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: "bad",
			region: "u",
			status: "bad",
			title: 1,
			clientName: 2,
			locales: "bad",
			defaultLocale: 3,
			metadata: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.clientName[0]);
		assert.isString(body.validation.body.locales[0]);
		assert.isString(body.validation.body.defaultLocale[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId,
			region,
			status,
			title: `${randomTitle}-invalid-metadata`,
			clientName: `${clientName}-invalid-metadata`,
			locales,
			defaultLocale,
			metadata: {
				billingCode: {
					invalid: true,
				},
			},
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.billingCode[0]);
	});

	it("Should return error if client already exists", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId,
			region,
			status,
			title: randomTitle,
			clientName,
			locales,
			defaultLocale,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
