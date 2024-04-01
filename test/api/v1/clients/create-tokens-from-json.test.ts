import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { Client } from "../../../../database/models/client";
import { gitJsonCorrect, gitJsonChange, gitJsonIncorrect } from "../../../dummy-data/git-json";
import { RegionEnum } from "@structured-growth/microservice-sdk";

describe("Check JSON operations", () => {
	const { server, context } = initTest();
	let createdClientId: number;

	before(async () => {
		const createdClient = await Client.create({
			orgId: 2,
			region: RegionEnum.US,
			status: "active",
			title: `TestClientName-${Date.now()}`,
			clientName: `TestClientName-${Date.now()}`.toLowerCase(),
			locales: ["en-US", "pt-Pt"],
		});

		createdClientId = createdClient.id;
	});

	it("Should create tokens and translation from JSON", async () => {
		const { statusCode } = await server.post(`/v1/clients/${createdClientId}/upload`).send(gitJsonCorrect);
		assert.equal(statusCode, 201);

		const { statusCode: getTokenStatusCode, body: getTokenBody } = await server.get("/v1/tokens").query({
			token: "common.sing_in",
		});
		assert.equal(getTokenStatusCode, 200);
		assert.isNumber(getTokenBody.data[0].orgId);
		assert.isNotNaN(new Date(getTokenBody.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(getTokenBody.data[0].updatedAt).getTime());
		assert.isString(getTokenBody.data[0].region);
		assert.isString(getTokenBody.data[0].arn);
		assert.isNumber(getTokenBody.data[0].clientId);
		assert.isString(getTokenBody.data[0].token);
		assert.equal(getTokenBody.data[0].token, "common.sing_in");

		const { statusCode: getTranslationStatusCode, body: getTranslationBody } = await server
			.get("/v1/translations")
			.query({
				orgId: 2,
				clientId: createdClientId,
			});
		assert.equal(getTranslationStatusCode, 200);
		assert.equal(getTranslationBody.total, 24);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post(`/v1/clients/${createdClientId}/upload`).send(gitJsonIncorrect);
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should change tokens and translation from JSON", async () => {
		const { statusCode, body } = await server.post(`/v1/clients/${createdClientId}/upload`).send(gitJsonChange);
		assert.equal(statusCode, 201);

		const { statusCode: getTokenStatusCode, body: getTokenBody } = await server.get("/v1/tokens").query({
			token: "errors.500",
		});
		assert.equal(getTokenStatusCode, 200);
		assert.equal(getTokenBody.total, 0);

		const { statusCode: getCheckTokenStatusCode, body: getCheckTokenBody } = await server.get("/v1/tokens").query({
			token: "errors.404",
		});
		assert.equal(getCheckTokenStatusCode, 200);
		const checkToken = getCheckTokenBody.data[0].id;

		const { statusCode: getTranslationStatusCode, body: getTranslationBody } = await server
			.get("/v1/translations")
			.query({
				orgId: 2,
				clientId: createdClientId,
			});
		assert.equal(getTranslationStatusCode, 200);
		assert.equal(getTranslationBody.total, 22);

		const { statusCode: getCheckTranslationStatusCode, body: getCheckTranslationBody } = await server
			.get("/v1/translations")
			.query({
				orgId: 2,
				clientId: createdClientId,
				tokenId: checkToken,
				"locales[0]": "en-US",
			});
		assert.equal(getTranslationStatusCode, 200);
		assert.equal(getTranslationBody.total, 22);
	});

	it("Should create JSON for translations", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/${createdClientId}/en-US`).send({});
		assert.equal(statusCode, 200);
		assert.isObject(body);
		assert.containsAllKeys(body.common, ["sing_in", "sing_up"]);
		assert.containsAllKeys(body.pages.home, ["welcome_message", "about_us"]);
		assert.containsAllKeys(body.pages.contact, ["phone", "email", "details"]);
		assert.containsAllKeys(body.errors, ["404", "messages"]);
		assert.containsAllKeys(body.errors.messages, ["404", "500"]);
		assert.strictEqual(body.pages.home.welcome_message, "Welcome to our website");
		assert.strictEqual(body.errors["404"], "Page Not Found Check");
		assert.strictEqual(body.errors.messages["404"], "The page you are looking for could not be found.");
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/${createdClientId}/verylonglanguagesparams`).send({});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return not found error", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/999999/en-US`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
