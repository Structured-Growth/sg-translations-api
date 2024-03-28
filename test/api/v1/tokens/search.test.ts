import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { Token } from "../../../../database/models/token";
import { RegionEnum } from "@structured-growth/microservice-sdk";

describe("GET /api/v1/tokens", () => {
	const { server, context } = initTest();
	let createdTokenId: number;

	before(async () => {
		const createdToken = await Token.create({
			orgId: 2,
			region: RegionEnum.US,
			clientId: 2,
			token: "test.test"
		});

		createdTokenId = createdToken.id;
	});

	after(async () => {
		await Token.destroy({ where: { id: createdTokenId } });
	});

	it("Should return 0 tokens", async () => {
		const { statusCode, body } = await server.get("/v1/tokens").query({
			orgId: 999999,
		});
		assert.equal(statusCode, 200);
	});

	it("Should return token", async () => {
		const { statusCode, body } = await server.get("/v1/tokens").query({
			"id[0]": createdTokenId,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, createdTokenId);
		assert.isNumber(body.data[0].orgId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.isString(body.data[0].region);
		assert.isString(body.data[0].arn);
		assert.isNumber(body.data[0].clientId);
		assert.isString(body.data[0].token);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/tokens").query({
			"id[0]": -1
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.query.id[0][0]);
	});
});