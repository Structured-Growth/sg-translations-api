import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import { Op } from "sequelize";
import { Transaction } from "sequelize/types";
import Translation, { TranslationAttributes } from "../../../database/models/translation";
import { TranslationSearchParamsInterface } from "../../interfaces/translation-search-params.interface";
import { TranslationCheckParamsInterface } from "../../interfaces/translation-check-changes-params.interface";
import { TranslationRepository } from "./translation.repository";
import { TranslationCreateBodyInterface } from "../../interfaces/translation-create-body.interface";

@autoInjectable()
export class TranslationService {
	constructor(@inject("TranslationRepository") private translationRepository: TranslationRepository) {}

	public async createMultiple(
		params: TranslationCreateBodyInterface[],
		options?: {
			transaction?: Transaction;
		}
	): Promise<Translation[]> {
		const action = async (transaction?: Transaction) => {
			return await Translation.bulkCreate(params, { transaction });
		};

		return options?.transaction ? action(options.transaction) : Translation.sequelize.transaction(action);
	}

	public async getTranslations(
		params: TranslationSearchParamsInterface,
		options?: {
			transaction?: Transaction;
		}
	): Promise<TranslationAttributes[]> {
		const action = async (transaction?: Transaction) => {
			const where = {};

			params.orgId && (where["orgId"] = params.orgId);
			params.clientId && (where["clientId"] = params.clientId);
			params.locales && (where["locale"] = { [Op.in]: params.locales });

			if (params.tokenId) {
				if (Array.isArray(params.tokenId)) {
					where["tokenId"] = { [Op.in]: params.tokenId };
				} else {
					where["tokenId"] = params.tokenId;
				}
			}

			const translations = await Translation.findAll({
				where,
				transaction,
			});

			if (translations.length > 0) {
				return translations;
			} else {
				return [];
			}
		};

		return options?.transaction ? action(options.transaction) : Translation.sequelize.transaction(action);
	}

	public async deleteMultipleWithTokens(tokens: number[], transaction: Transaction): Promise<void> {
		const n = await Translation.destroy({ where: { tokenId: tokens }, transaction });

		if (n === 0) {
			throw new NotFoundError(`None of the clients with tokens ids were found`);
		}
	}

	public async actualizeTranslation(
		params: TranslationCheckParamsInterface,
		options?: {
			transaction?: Transaction;
		}
	): Promise<void> {
		const { orgId, clientId, locales, commonTokens, jsonTokens } = params;
		const translationsForChange: { id: number; text: string }[] = [];

		const defaultItems = commonTokens.map((commonToken) => {
			return {
				token: commonToken.token,
				id: commonToken.id,
				textEn: jsonTokens[commonToken.token],
			};
		});

		const translationsForCheck = await this.getTranslations(
			{
				orgId,
				clientId,
				locales,
				tokenId: defaultItems.map((token) => token.id),
			},
			{ transaction: options?.transaction }
		);

		translationsForCheck.map((translation) => {
			const newToken = defaultItems.find((token) => token.id === translation.tokenId);
			if (newToken.textEn !== translation.text && translation.locale === "en-US") {
				translationsForChange.push({ id: translation.id, text: newToken.textEn });

				for (const item of translationsForCheck) {
					if (item.tokenId === newToken.id && item.locale !== "en-US") {
						translationsForChange.push({ id: item.id, text: "" });
					}
				}
			}
		});

		if (translationsForChange) {
			for (const translation of translationsForChange) {
				await this.translationRepository.update(
					translation.id,
					{
						text: translation.text,
					},
					options?.transaction
				);
			}
		}
	}
}
