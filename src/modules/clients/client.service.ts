import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import Client from "../../../database/models/client";
import { TokenAttributes } from "../../../database/models/token";
import { ClientCreateBodyInterface } from "../../interfaces/client-create-body.interface";
import { ClientRepository } from "./client.repository";
import { TokenService } from "../tokens/token.service";
import { TranslationService } from "../translations/translation.service";
import { JobService } from "../jobs/job.service";
import { ClientCreateTranslationBodyInterface } from "../../interfaces/client-create-translation-body.interface";
import { TokenCreateBodyInterface } from "../../interfaces/token-create-body.interface";
import { TranslationCreateBodyInterface } from "../../interfaces/translation-create-body.interface";
import flattenObjectKeys from "../../helpers/flatten-object-keys";
import convertToObject from "../../helpers/convert-to-object";
import { ClientCreateDynamicTranslateBodyInterface } from "../../interfaces/client-create-dynamic-translate-body.interface";
import { TranslationAttributes } from "../../../database/models/translation";
import { ClientGetLocalizedTranslationParamsInterface } from "../../interfaces/client-get-localized-translation-params.interface";

// For devops

@autoInjectable()
export class ClientService {
	private i18n: I18nType;
	constructor(
		@inject("ClientRepository") private clientRepository: ClientRepository,
		@inject("TokenService") private tokenService: TokenService,
		@inject("TranslationService") private translationService: TranslationService,
		@inject("JobService") private jobService: JobService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: ClientCreateBodyInterface): Promise<Client> {
		const { clientName } = params;

		const [countResult]: { count: number }[] = await Client.count({
			where: { clientName },
			group: [],
		});

		const count = countResult?.count || 0;

		if (count > 0) {
			throw new ValidationError({
				clientName: this.i18n.__("error.client.exist"),
			});
		}

		return this.clientRepository.create({
			orgId: params.orgId,
			region: params.region,
			status: params.status || "inactive",
			title: params.title,
			clientName: params.clientName,
			locales: params.locales,
			defaultLocale: params.defaultLocale,
		});
	}

	public async createJobTranslation(
		clientId: number,
		params: ClientCreateDynamicTranslateBodyInterface
	): Promise<void> {
		const { translator, locales } = params;

		const client = await this.clientRepository.read(clientId);

		if (!client) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.name")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const missingLocales = locales.filter((locale) => !client.locales.includes(locale));

		if (missingLocales.length > 0) {
			throw new NotFoundError(`${this.i18n.__("error.client.languages_not_supported")} ${missingLocales.join(", ")}`);
		}

		const translations: TranslationAttributes[] = await this.translationService.getTranslations({
			orgId: client.orgId,
			clientId,
			locales: [...locales, "en-US"],
		});

		if (translations.length > 0) {
			const jobs: { clientId: number; locale: string; translationsForJob: object }[] = [];
			const defaultTranslations = translations.filter((translation) => translation.locale === "en-US");

			for (const locale of locales) {
				const localeTranslations = translations.filter((translation) => translation.locale === locale);
				const translationsForJob = {};

				for (const item of localeTranslations) {
					const defaultTranslation = defaultTranslations.find((translation) => translation.tokenId === item.tokenId);
					if (defaultTranslation) {
						translationsForJob[item.id] = defaultTranslation.text;
					}
				}

				jobs.push({ clientId, locale, translationsForJob });
			}

			//TODO Complete aws integration
			// await this.jobService.createJob(orgId, region, translator, jobs);
		}
	}

	public async getLocalizedTranslation(
		clientId: number,
		locale: string,
		params: ClientGetLocalizedTranslationParamsInterface
	): Promise<object> {
		const { format } = params;

		const client = await this.clientRepository.read(clientId);
		if (!client) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.name")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}
		if (!client.locales.includes(locale)) {
			throw new NotFoundError(this.i18n.__("error.client.not_database"));
		}

		const orgId = client.orgId;
		const jsonItems: { [key: string]: string } = {};
		let result = {};

		const tokens = await this.tokenService.getTokens({
			orgId,
			clientId,
		});

		if (tokens.length === 0) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.tokens")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const translations = await this.translationService.getTranslations({
			orgId,
			clientId,
			locales: [locale],
			tokenId: tokens.map((token) => token.id),
		});

		if (translations.length === 0) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.translations")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		tokens.forEach((token) => {
			const translation = translations.find((translation) => translation.tokenId === token.id);
			if (translation) {
				jsonItems[token.token] = translation.text;
			}
		});

		if (Object.keys(jsonItems).length !== 0) {
			if (format === "dot") {
				result = jsonItems;
			} else {
				result = convertToObject(jsonItems);
			}
		}

		return result;
	}

	public async createFromJSON(clientId: number, params: ClientCreateTranslationBodyInterface): Promise<void> {
		const { data } = params;
		const client = await this.clientRepository.read(clientId);

		if (!client) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.name")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const clientLocales = client.locales;

		const jsonTokens = flattenObjectKeys(data);
		const jsonTokensNames = Object.keys(jsonTokens);

		await Client.sequelize.transaction(async (transaction) => {
			const tableTokens: TokenAttributes[] = await this.tokenService.getTokens(
				{
					orgId: client.orgId,
					clientId,
				},
				{ transaction }
			);

			const { newTokens, unusedTokens, commonTokens } = this.tokenService.findDifference({
				newArray: jsonTokensNames,
				oldArray: tableTokens.map((item) => ({ token: item.token, id: item.id })),
			});

			if (unusedTokens.length > 0) {
				await this.tokenService.deleteMultiple(unusedTokens, { transaction });
			}

			if (newTokens.length > 0) {
				const tokensToCreate: TokenCreateBodyInterface[] = newTokens.map((token) => ({
					orgId: client.orgId,
					region: client.region,
					clientId,
					token,
				}));

				const createdTokens = await this.tokenService.createMultiple(tokensToCreate, { transaction });

				const translationsToCreate: TranslationCreateBodyInterface[] = [];

				clientLocales.forEach((locale) => {
					createdTokens.forEach((token) => {
						translationsToCreate.push({
							orgId: client.orgId,
							region: client.region,
							clientId,
							tokenId: token.id,
							locale,
							text: locale === client.defaultLocale ? jsonTokens[token.token] : "",
						});
					});
				});

				await this.translationService.createMultiple(translationsToCreate, { transaction });
			}

			await this.translationService.actualizeTranslation(
				{
					orgId: client.orgId,
					clientId,
					locales: clientLocales,
					defaultLocale: client.defaultLocale,
					commonTokens,
					jsonTokens,
				},
				{ transaction }
			);
		});
	}

	public async updateFromJSON(clientId: number, params: ClientCreateTranslationBodyInterface): Promise<void> {
		const { data, locale } = params;

		const client = await this.clientRepository.read(clientId);

		if (!client) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.name")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const jsonTokens = flattenObjectKeys(data);
		const jsonTokensNames = Object.keys(jsonTokens);

		await Client.sequelize.transaction(async (transaction) => {
			const tableTokens: TokenAttributes[] = await this.tokenService.getTokens(
				{
					orgId: client.orgId,
					clientId,
				},
				{ transaction }
			);

			const { newTokens, unusedTokens, commonTokens } = this.tokenService.findDifference({
				newArray: jsonTokensNames,
				oldArray: tableTokens.map((item) => ({ token: item.token, id: item.id })),
			});

			if (unusedTokens.length > 0) {
				throw new ValidationError({
					clientName: this.i18n.__("error.client.non_existent_tokens"),
				});
			}

			if (newTokens.length > 0) {
				throw new ValidationError({
					clientName: this.i18n.__("error.client.new_tokens"),
				});
			}

			await this.translationService.updateTranslations(
				{
					orgId: client.orgId,
					clientId,
					locales: [locale],
					commonTokens,
					jsonTokens,
				},
				{ transaction }
			);
		});
	}
}
