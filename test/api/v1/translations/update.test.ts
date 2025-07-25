import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { Translation } from "../../../../database/models/translation";
import { Token } from "../../../../database/models/token";
import { Client } from "../../../../database/models/client";
import { RegionEnum } from "@structured-growth/microservice-sdk";

describe("PUT /api/v1/translations/:translationId", () => {
	const { server, context } = initTest();
	let createdTranslationId: number;
	let createdTokenId: number;
	let createdClientId: number;

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

		const createdToken = await Token.create({
			orgId: 2,
			region: RegionEnum.US,
			clientId: createdClientId,
			token: "test.test",
		});

		createdTokenId = createdToken.id;

		const createdTranslation = await Translation.create({
			orgId: 2,
			region: RegionEnum.US,
			tokenId: createdTokenId,
			clientId: createdClientId,
			locale: "en-US",
			text: "Testing text",
		});

		createdTranslationId = createdTranslation.id;
	});

	after(async () => {
		await Translation.destroy({ where: { id: createdTranslationId } });
		await Token.destroy({ where: { id: createdTokenId } });
		await Client.destroy({ where: { id: createdClientId } });
	});

	it("Should update translation", async () => {
		const { statusCode, body } = await server.put(`/v1/translations/${createdTranslationId}`).send({
			text: "New text",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, createdTranslationId);
		assert.isNumber(body.orgId);
		assert.isNumber(body.clientId);
		assert.isNumber(body.tokenId);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
		assert.isString(body.locale);
		assert.equal(body.text, "New text");
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/translations/5689`).send({
			status: "deleted",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/translations/9999`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
