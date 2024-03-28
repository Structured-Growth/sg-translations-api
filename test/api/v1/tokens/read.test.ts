import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { Token } from "../../../../database/models/token";
import { RegionEnum } from "@structured-growth/microservice-sdk";


describe("GET /api/v1/tokens/:tokenId", () => {
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

	it("Should read token", async () => {
		const { statusCode, body } = await server.get(`/v1/tokens/${createdTokenId}`).send({});
		assert.equal(statusCode, 200);
		assert.equal(body.id, createdTokenId);
		assert.isNumber(body.orgId);
		assert.isNumber(body.clientId);
		assert.isString(body.createdAt);
		assert.isString(body.region);
		assert.isString(body.arn);
		assert.isString(body.token);
	});

	it("Should return is token does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/tokens/999999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/tokens/mainaccount`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});