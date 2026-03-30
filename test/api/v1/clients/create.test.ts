import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedClientCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/clients", () => {
	const { server, context } = initTest();

	const randomOrgId = Math.floor(Math.random() * 100) + 1;
	const region = "us";
	const status = "active";
	const randomTitle = `TestClientName-${Date.now()}`;
	const clientName = randomTitle.toLowerCase();
	const locales = ["en-US", "pt-PT"];
	const defaultLocale = "en-US";

	beforeEach(() => seedClientCustomFields(randomOrgId));

	it("Should create client", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: randomOrgId,
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
		assert.equal(body.orgId, randomOrgId);
		assert.equal(body.region, region);
		assert.equal(body.title, randomTitle);
		assert.equal(body.clientName, clientName);
		assert.deepStrictEqual(body.locales, locales);
		assert.isNull(body.metadata);
	});

	it("Should create client with metadata", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: randomOrgId,
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

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: randomOrgId,
			region,
			status,
			title: `${randomTitle}-invalid`,
			clientName: `${clientName}-invalid`,
			locales,
			defaultLocale,
			metadata: {
				billingCode: "A",
			},
		});
		assert.equal(statusCode, 422);
		assert.isString(body.validation.body.metadata.billingCode[0]);
	});

	it("Should return validation error client", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: 123,
			region: "de",
			status: "inactive",
			title: 42,
			clientName: "mistake",
			locales: ["de-DE", "it-IT"],
			defaultLocale: 77,
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.title[0]);
	});

	it("Should return error if client already exists", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: randomOrgId,
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
