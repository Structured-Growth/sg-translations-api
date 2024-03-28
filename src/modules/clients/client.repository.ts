import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Client, {ClientCreationAttributes} from "../../../database/models/client";
import { ClientSearchParamsInterface } from "../../interfaces/client-search-params.interface";
import { ClientUpdateBodyInterface } from "../../interfaces/client-update-body.interface";

@autoInjectable()
export class ClientRepository
	implements RepositoryInterface<Client, ClientSearchParamsInterface, ClientCreationAttributes> {

	public async search(params: ClientSearchParamsInterface): Promise<SearchResultInterface<Client>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });
		params.clientName && (where["clientName"] = { [Op.in]: params.clientName });
		params.locales && (where["locales"] = { [Op.contains]: params.locales });

		const { rows, count } = await Client.findAndCountAll({
			where,
			offset,
			limit,
			order,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: ClientCreationAttributes): Promise<Client> {
		return Client.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Client | null> {
		return Client.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: ClientUpdateBodyInterface): Promise<Client> {
		const client = await this.read(id);

		if (!client) {
			throw new NotFoundError(`Client ${id} not found`);
		}
		client.setAttributes(params);

		return client.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Client.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Client ${id} not found`);
		}
	}
}