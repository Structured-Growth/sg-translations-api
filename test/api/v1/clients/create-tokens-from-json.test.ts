import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { gitJsonCorrect, gitJsonChange, gitJsonIncorrect} from "../../../dummy-data/git-json";

describe("POST /api/v1/clients/:clientId/upload", () => {
	const { server, context } = initTest();

	it("Should create tokens and translation from JSON", async () => {
		const { statusCode} = await server.post(`/v1/clients/3/upload`).send(gitJsonCorrect);
		assert.equal(statusCode, 201);

		const { statusCode: getTokenStatusCode, body: getTokenBody } = await server.get("/v1/tokens").query({
			"token": "common.sing_in",
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
		assert.equal(getTokenBody.page, 1);
		assert.equal(getTokenBody.limit, 20);
		assert.equal(getTokenBody.total, 1);

		const { statusCode: getTranslationStatusCode, body: getTranslationBody } = await server.get("/v1/translations").query({
			"orgId": 3,
			"clientId": 3,
		});
		assert.equal(getTranslationStatusCode, 200);
		assert.equal(getTranslationBody.total, 24);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post(`/v1/clients/3/upload`).send(gitJsonIncorrect);
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should change tokens and translation from JSON", async () => {
		const { statusCode, body } = await server.post(`/v1/clients/3/upload`).send(gitJsonChange);
		assert.equal(statusCode, 201);

		const { statusCode: getTokenStatusCode, body: getTokenBody } = await server.get("/v1/tokens").query({
			"token": "errors.500",
		});
		assert.equal(getTokenStatusCode, 200);
		assert.equal(getTokenBody.total, 0);

		const { statusCode: getCheckTokenStatusCode, body: getCheckTokenBody } = await server.get("/v1/tokens").query({
			"token": "errors.404",
		});
		assert.equal(getCheckTokenStatusCode, 200);
		const checkToken = getCheckTokenBody.data[0].id;

		const { statusCode: getTranslationStatusCode, body: getTranslationBody } = await server.get("/v1/translations").query({
			"orgId": 3,
			"clientId": 3,
		});
		assert.equal(getTranslationStatusCode, 200);
		assert.equal(getTranslationBody.total, 22);

		const { statusCode: getCheckTranslationStatusCode, body: getCheckTranslationBody } = await server.get("/v1/translations").query({
			"orgId": 3,
			"clientId": 3,
			"tokenId": checkToken,
			"locales[0]": "en-US"
		});
		assert.equal(getTranslationStatusCode, 200);
		// assert.equal(getTranslationBody.data[0].text, "Page Not Found Check");
	});
});