import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import { Transaction } from "sequelize/types";
import Translation, {
	TranslationCreationAttributes,
	TranslationUpdateAttributes,
} from "../../../database/models/translation";
import { TranslationSearchParamsInterface } from "../../interfaces/translation-search-params.interface";

@autoInjectable()
export class TranslationRepository
	implements RepositoryInterface<Translation, TranslationSearchParamsInterface, TranslationCreationAttributes>
{
	public async search(params: TranslationSearchParamsInterface): Promise<SearchResultInterface<Translation>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.clientId && (where["clientId"] = params.clientId);
		params.tokensId && (where["tokenId"] = params.tokensId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.locales && (where["locale"] = { [Op.in]: params.locales });

		const { rows, count } = await Translation.findAndCountAll({
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

	public async create(params: TranslationCreationAttributes): Promise<Translation> {
		return Translation.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		},
		transaction?: Transaction
	): Promise<Translation | null> {
		return Translation.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
			transaction,
		});
	}

	public async update(
		id: number,
		params: TranslationUpdateAttributes,
		transaction?: Transaction
	): Promise<Translation> {
		const translation = await this.read(id, {}, transaction);
		if (!translation) {
			throw new NotFoundError(`Translation ${id} not found`);
		}

		translation.setAttributes(params);

		return translation.save({ transaction });
	}

	public async delete(id: number): Promise<void> {
		const n = await Translation.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Translation ${id} not found`);
		}
	}
}
