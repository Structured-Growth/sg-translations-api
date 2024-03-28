import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/clients/:clientId/:locale", () => {
	const { server, context } = initTest();

	it("Should create JSON for translations", async () => {
		const { statusCode, body } = await server.get(`/v1/clients/3/en-US`).send({});
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
		const { statusCode, body } = await server.get(`/v1/clients/3/verylonglanguagesparams`).send({});
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