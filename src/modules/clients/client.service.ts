import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
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

@autoInjectable()
export class ClientService {
	constructor(
		@inject("ClientRepository") private clientRepository: ClientRepository,
		@inject("TokenService") private tokenService: TokenService,
		@inject("TranslationService") private translationService: TranslationService,
		@inject("JobService") private jobService: JobService
	) {}

	public async create(params: ClientCreateBodyInterface): Promise<Client> {
		const { clientName } = params;

		const [countResult]: { count: number }[] = await Client.count({
			where: { clientName },
			group: [],
		});

		const count = countResult[0]?.count || 0;

		if (count > 0) {
			throw new ValidationError({
				clientName: "Client with the same name is already exist",
			});
		}

		return this.clientRepository.create({
			orgId: params.orgId,
			region: params.region,
			status: params.status || "inactive",
			title: params.title,
			clientName: params.clientName,
			locales: params.locales,
		});
	}

	public async createJobTranslation(
		clientId: number,
		params: ClientCreateDynamicTranslateBodyInterface
	): Promise<void> {
		const { orgId, region, translator, locales } = params;

		const client: Client = await this.clientRepository.read(clientId);
		if (!client) {
			throw new NotFoundError(`Client with ${clientId} id not found`);
		}

		const missingLocales: string[] = locales.filter((locale) => !client.dataValues.locales.includes(locale));

		if (missingLocales.length > 0) {
			throw new NotFoundError(`These languages are not supported by the client: ${missingLocales.join(", ")}`);
		}

		const translations: TranslationAttributes[] = await this.translationService.allTranslations({
			orgId,
			clientId,
			locales: [...locales, "en-US"],
		});

		if (translations.length > 0) {
			const jobs: { clientId: number; locale: string; translationsForJob: object }[] = [];
			const defaultTranslations: TranslationAttributes[] = translations.filter(
				(translation) => translation.locale === "en-US"
			);

			for (const locale of locales) {
				const localeTranslations: TranslationAttributes[] = translations.filter(
					(translation) => translation.locale === locale
				);
				const translationsForJob = {};

				for (const item of localeTranslations) {
					const defaultTranslation: TranslationAttributes = defaultTranslations.find(
						(translation) => translation.tokenId === item.tokenId
					);
					if (defaultTranslation) {
						translationsForJob[item.id] = defaultTranslation.text;
					}
				}

				jobs.push({ clientId, locale, translationsForJob });
			}

			// await this.jobService.createJob(orgId, region, translator, jobs);
		}
	}

	public async getLocalizedTranslation(clientId: number, locale: string): Promise<object> {
		const client: Client = await this.clientRepository.read(clientId);
		if (!client) {
			throw new NotFoundError(`Client with ${clientId} id not found`);
		}
		if (!client.locales.includes(locale)) {
			throw new NotFoundError(`This language is not in the database`);
		}

		const orgId: number = client.orgId;
		const jsonItems: { [key: string]: string } = {};
		let result = {};

		const tokens: TokenAttributes[] = await this.tokenService.allTokens({
			orgId,
			clientId,
		});

		if (!tokens) {
			throw new NotFoundError(`Tokens with ${clientId} id not found`);
		}

		const translations = await this.translationService.allTranslations({
			orgId,
			clientId,
			locales: [locale],
			tokensId: tokens.map((token) => token.id),
		});

		if (!translations) {
			throw new NotFoundError(`Translations with ${clientId} id not found`);
		}

		tokens.forEach((token) => {
			const translation = translations.find((translation) => translation.tokenId === token.id);
			if (translation) {
				jsonItems[token.token] = translation.text;
			}
		});

		if (Object.keys(jsonItems).length !== 0) {
			result = convertToObject(jsonItems);
		}

		return result;
	}

	public async createFromJSON(clientId: number, params: ClientCreateTranslationBodyInterface): Promise<void> {
		const { data, orgId, region, locale } = params;
		const client = await this.clientRepository.read(clientId);

		if (!client) {
			throw new NotFoundError(`Client with ${clientId} id not found`);
		}

		const clientLocales = client.locales;

		const jsonTokens = flattenObjectKeys(data);
		const jsonTokensNames = Object.keys(jsonTokens);

		const tableTokens: TokenAttributes[] = await this.tokenService.allTokens({
			orgId,
			clientId,
		});

		const { newTokens, unusedTokens, commonTokens } = this.tokenService.findDifference({
			newArray: jsonTokensNames,
			oldArray: tableTokens.map((item) => ({ token: item.token, id: item.id })),
		});

		if (unusedTokens.length > 0) {
			await this.tokenService.deleteMultiple(unusedTokens);
		}

		if (newTokens.length > 0) {
			const tokensToCreate: TokenCreateBodyInterface[] = newTokens.map((token) => ({
				orgId,
				region,
				clientId,
				token,
			}));

			const createdTokens = await this.tokenService.createMultiple(tokensToCreate);

			const translationsToCreate: TranslationCreateBodyInterface[] = [];

			clientLocales.forEach((locale) => {
				createdTokens.forEach((token) => {
					translationsToCreate.push({
						orgId,
						region,
						clientId,
						tokenId: token.id,
						locale,
						text: locale === "en-US" ? jsonTokens[token.token] : "",
					});
				});
			});

			await this.translationService.createMultiple(translationsToCreate);
		}

		await this.translationService.actualizeTranslation({
			orgId,
			clientId,
			locales: clientLocales,
			commonTokens,
			jsonTokens,
		});
	}
}
