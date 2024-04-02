import { assert } from "chai";
import { set } from "lodash";

export function createClient(
	server,
	context: Record<any, any>,
	options: {
		orgId: number;
		region: string;
		status: string;
		title: string;
		clientName: string;
		locales: string[];
		contextPath: string;
	}
) {
	it("Should create client", async () => {
		const { statusCode, body } = await server.post("/v1/clients").send({
			orgId: options.orgId,
			region: options.region,
			status: options.status,
			title: options.title,
			clientName: options.clientName,
			locales: options.locales
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		set(context, options.contextPath, body);
	});
}