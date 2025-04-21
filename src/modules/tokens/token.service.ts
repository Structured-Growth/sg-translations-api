import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { Transaction } from "sequelize/types";
import Token, { TokenAttributes } from "../../../database/models/token";
import { TokenRepository } from "./token.repository";
import { TranslationService } from "../translations/translation.service";
import { TokenCreateBodyInterface } from "../../interfaces/token-create-body.interface";
import { TokenSearchParamsInterface } from "../../interfaces/token-search-params.interface";
import { TokenFindDifferenceParamsInterface } from "../../interfaces/token-fine-difference-params.interface";

@autoInjectable()
export class TokenService {
	private i18n: I18nType;
	constructor(
		@inject("TokenRepository") private tokenRepository: TokenRepository,
		@inject("TranslationService") private translationService: TranslationService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: TokenCreateBodyInterface): Promise<Token> {
		const token = params.token;
		const [countResult]: { count: number }[] = await Token.count({
			where: { token },
			group: [],
		});

		const count = countResult[0]?.count || 0;

		if (count > 0) {
			throw new ValidationError({
				token: this.i18n.__("error.token.exist"),
			});
		}

		return this.tokenRepository.create({
			orgId: params.orgId,
			region: params.region,
			token: params.token,
			clientId: params.clientId,
		});
	}

	public async createMultiple(
		params: TokenCreateBodyInterface[],
		options?: {
			transaction?: Transaction;
		}
	): Promise<TokenAttributes[]> {
		const action = async (transaction?: Transaction) => {
			return await Token.bulkCreate(params, { transaction });
		};

		return options?.transaction ? action(options.transaction) : Token.sequelize.transaction(action);
	}

	public async deleteMultiple(
		tokens: number[],
		options?: {
			transaction?: Transaction;
		}
	): Promise<void> {
		const action = async (transaction?: Transaction) => {
			await this.translationService.deleteMultipleWithTokens(tokens, transaction);

			const n = await Token.destroy({ where: { id: tokens }, transaction });

			if (n === 0) {
				throw new NotFoundError(this.i18n.__("error.token.none_clients"));
			}
		};

		return options?.transaction ? action(options.transaction) : Token.sequelize.transaction(action);
	}

	public async getTokens(
		params: TokenSearchParamsInterface,
		options?: {
			transaction?: Transaction;
		}
	): Promise<TokenAttributes[]> {
		const action = async (transaction?: Transaction) => {
			const where = {};

			params.orgId && (where["orgId"] = params.orgId);
			params.clientId && (where["clientId"] = params.clientId);

			return Token.findAll({
				where,
				transaction,
			});
		};

		return options?.transaction ? action(options.transaction) : Token.sequelize.transaction(action);
	}

	public findDifference(params: TokenFindDifferenceParamsInterface): {
		newTokens: string[];
		unusedTokens: number[];
		commonTokens: { token: string; id: number }[];
	} {
		let newTokens: string[] = [];
		let unusedTokens: number[] = [];
		let commonTokens: { token: string; id: number }[] = [];

		const unusedTokensSet = params.oldArray.map((item) => item.token);

		for (let i = 0; i < params.newArray.length; i++) {
			if (!unusedTokensSet.includes(params.newArray[i])) {
				newTokens.push(params.newArray[i]);
			}
		}

		for (let i = 0; i < params.oldArray.length; i++) {
			if (!params.newArray.includes(params.oldArray[i].token)) {
				unusedTokens.push(params.oldArray[i].id);
			} else {
				commonTokens.push({ token: params.oldArray[i].token, id: params.oldArray[i].id });
			}
		}

		return { newTokens, unusedTokens, commonTokens };
	}
}
