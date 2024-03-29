import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import { Op } from "sequelize";
import { Transaction } from "sequelize/types";
import Translation, { TranslationAttributes } from "../../../database/models/translation";
import { TranslationUpdateBodyInterface } from "../../interfaces/translation-update-body.interface";
import { TranslationSearchParamsInterface } from "../../interfaces/translation-search-params.interface";
import { TranslationCheckParamsInterface } from "../../interfaces/translation-check-changes-params.interface";
import { TranslationRepository } from "./translation.repository";
import { TranslationCreateBodyInterface } from "../../interfaces/translation-create-body.interface";

@autoInjectable()
export class TranslationService {
	constructor(@inject("TranslationRepository") private translationRepository: TranslationRepository) {}

	public async createMultiple(params: TranslationCreateBodyInterface[]): Promise<Translation[]> {
		return Translation.sequelize.transaction(async (transaction) => {
			return await Translation.bulkCreate(params, { transaction });
		});
	}

	public async allTranslations(params: TranslationSearchParamsInterface): Promise<TranslationAttributes[]> {
		return Translation.sequelize.transaction(async (transaction) => {
			const where = {};

			params.orgId && (where["orgId"] = params.orgId);
			params.clientId && (where["clientId"] = params.clientId);
			params.locales && (where["locale"] = { [Op.in]: params.locales });

			if (params.tokensId) {
				if (Array.isArray(params.tokensId)) {
					where["tokenId"] = { [Op.in]: params.tokensId };
				} else {
					where["tokenId"] = params.tokensId;
				}
			}

			const translations = await Translation.findAll({
				where,
				transaction,
			});

			if (translations.length > 0) {
				return translations.map((translation) => translation.dataValues);
			} else {
				return [];
			}
		});
	}

	public async deleteMultipleWithTokens(tokens: number[], transaction: Transaction): Promise<void> {
		const n = await Translation.destroy({ where: { tokenId: tokens }, transaction });

		if (n === 0) {
			throw new NotFoundError(`None of the clients with tokens ids were found`);
		}
	}

	public async checkTranslationChanges(params: TranslationCheckParamsInterface): Promise<void> {
		const { orgId, clientId, locales, commonTokens, jsonTokens } = params;
		const translationsForChange: { id: number; text: string }[] = [];

		const defaultItems = commonTokens.map((commonToken) => {
			const textObj = jsonTokens.find((jsonToken) => jsonToken[commonToken.token]);
			const text = textObj ? textObj[commonToken.token] : "";
			return {
				token: commonToken.token,
				id: commonToken.id,
				textEn: text,
			};
		});

		const tokensId: number[] = commonTokens.map((token) => token.id);
		const translationsForCheck: TranslationAttributes[] = await this.allTranslations({
			orgId,
			clientId,
			locales,
			tokensId,
		});

		translationsForCheck.map((translation) => {
			const newToken = defaultItems.find((token) => token.id === translation.tokenId);
			if (newToken.textEn !== translation.text && translation.locale === "en-US") {
				const tokenChangeId = newToken.id;
				translationsForChange.push({ id: translation.id, text: newToken.textEn });

				for (const item of translationsForCheck) {
					if (item.tokenId === tokenChangeId && item.locale !== "en-US") {
						translationsForChange.push({ id: item.id, text: "" });
					}
				}
			}
		});

		if (translationsForChange) {
			return Translation.sequelize.transaction(async (transaction) => {
				for (const translation of translationsForChange) {
					await this.translationRepository.update(
						translation.id,
						{
							text: translation.text,
						},
						transaction
					);
				}
			});
		}
	}
}
