import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import Token, { TokenAttributes } from "../../../database/models/token";
import { TokenRepository } from "./token.repository";
import { TranslationService } from "../translations/translation.service";
import { TokenCreateBodyInterface } from "../../interfaces/token-create-body.interface";
import { TokenSearchParamsInterface } from "../../interfaces/token-search-params.interface";
import { TokenFindDifferenceParamsInterface } from "../../interfaces/token-fine-difference-params.interface";

@autoInjectable()
export class TokenService {
	constructor(
		@inject("TokenRepository") private tokenRepository: TokenRepository,
		@inject("TranslationService") private translationService: TranslationService
	) {}

	public async create(params: TokenCreateBodyInterface): Promise<Token> {
		const token = params.token;
		const [countResult]: { count: number }[] = await Token.count({
			where: { token },
			group: [],
		});

		const count = countResult[0]?.count || 0;

		if (count > 0) {
			throw new ValidationError({
				token: "Token with the same name is already exist",
			});
		}

		return this.tokenRepository.create({
			orgId: params.orgId,
			region: params.region,
			token: params.token,
			clientId: params.clientId,
		});
	}

	public async createMultiple(params: TokenCreateBodyInterface[]): Promise<TokenAttributes[]> {
		return Token.sequelize.transaction(async (transaction) => {
			return await Token.bulkCreate(params, { transaction });
			// return tokens.map((token) => token.dataValues);
		});
	}

	public async deleteMultiple(tokens: number[]): Promise<void> {
		return Token.sequelize.transaction(async (transaction) => {
			await this.translationService.deleteMultipleWithTokens(tokens, transaction);

			const n = await Token.destroy({ where: { id: tokens }, transaction });

			if (n === 0) {
				throw new NotFoundError(`None of the clients with tokens ids were found`);
			}
		});
	}

	public async allTokens(params: TokenSearchParamsInterface): Promise<TokenAttributes[]> {
		return Token.sequelize.transaction(async (transaction) => {
			const where = {};

			params.orgId && (where["orgId"] = params.orgId);
			params.clientId && (where["clientId"] = params.clientId);

			const tokens = await Token.findAll({
				where,
				transaction,
			});

			if (tokens.length > 0) {
				return tokens.map((token) => token.dataValues);
			} else {
				return [];
			}
		});
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
