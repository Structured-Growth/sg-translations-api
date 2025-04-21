import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import Token, { TokenCreationAttributes } from "../../../database/models/token";
import { TokenSearchParamsInterface } from "../../interfaces/token-search-params.interface";
import { TokenUpdateBodyInterface } from "../../interfaces/token-update-body.interface";

@autoInjectable()
export class TokenRepository
	implements RepositoryInterface<Token, TokenSearchParamsInterface, TokenCreationAttributes>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: TokenSearchParamsInterface): Promise<SearchResultInterface<Token>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.clientId && (where["clientId"] = params.clientId);
		params.token && (where["token"] = params.token);

		const { rows, count } = await Token.findAndCountAll({
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

	public async create(params: TokenCreationAttributes): Promise<Token> {
		return Token.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Token | null> {
		return Token.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: TokenUpdateBodyInterface): Promise<Token> {
		const token = await this.read(id);

		if (!token) {
			throw new NotFoundError(`${this.i18n.__("error.token.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
		token.setAttributes(params);

		return token.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Token.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`${this.i18n.__("error.token.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
	}
}
