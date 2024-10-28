import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Path, Put } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	NotFoundError,
	SearchResultInterface,
	ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { TranslationAttributes } from "../../../database/models/translation";
import { TranslationRepository } from "../../modules/translations/translation.repository";
import { TranslationService } from "../../modules/translations/translation.service";
import { TranslationSearchParamsInterface } from "../../interfaces/translation-search-params.interface";
import { pick } from "lodash";
import { TranslationUpdateBodyInterface } from "../../interfaces/translation-update-body.interface";
import { TranslationSearchParamsValidator } from "../../validators/translation-search-params.validator";
import { TranslationReadParamsValidator } from "../../validators/translation-read-params.validator";
import { TranslationUpdateParamsValidator } from "../../validators/translation-update-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicTranslationAttributes = [
	"id",
	"orgId",
	"region",
	"createdAt",
	"updatedAt",
	"arn",
	"tokenId",
	"clientId",
	"locale",
	"text",
] as const;
type TranslationKeys = (typeof publicTranslationAttributes)[number];
type PublicTranslationAttributes = Pick<TranslationAttributes, TranslationKeys>;

@Route("v1/translations")
@Tags("Translations")
@autoInjectable()
export class TranslationsController extends BaseController {
	constructor(
		@inject("TranslationRepository") private translationRepository: TranslationRepository,
		@inject("TranslationService") private translationService: TranslationService
	) {
		super();
	}

	/**
	 * Search Translations
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of translations")
	@DescribeAction("translations/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Client", ({ query }) => Number(query.clientId))
	@ValidateFuncArgs(TranslationSearchParamsValidator)
	async search(
		@Queries() query: TranslationSearchParamsInterface
	): Promise<SearchResultInterface<PublicTranslationAttributes>> {
		const { data, ...result } = await this.translationRepository.search(query);

		return {
			data: data.map((translation) => ({
				...(pick(translation.toJSON(), publicTranslationAttributes) as PublicTranslationAttributes),
				arn: translation.arn,
			})),
			...result,
		};
	}

	/**
	 * Get Translation
	 */
	@OperationId("Read")
	@Get("/:translationId")
	@SuccessResponse(200, "Returns translation")
	@DescribeAction("translations/read")
	@DescribeResource("Translation", ({ params }) => Number(params.translationId))
	@ValidateFuncArgs(TranslationReadParamsValidator)
	async get(@Path() translationId: number): Promise<PublicTranslationAttributes> {
		const translation = await this.translationRepository.read(translationId);

		if (!translation) {
			throw new NotFoundError(`Translation ${translation} not found`);
		}

		return {
			...(pick(translation.toJSON(), publicTranslationAttributes) as PublicTranslationAttributes),
			arn: translation.arn,
		};
	}

	/**
	 * Update Translation
	 */
	@OperationId("Update")
	@Put("/:translationId")
	@SuccessResponse(200, "Returns updated translation")
	@DescribeAction("translations/update")
	@DescribeResource("Translation", ({ params }) => Number(params.translationId))
	@ValidateFuncArgs(TranslationUpdateParamsValidator)
	async update(
		@Path() translationId: number,
		@Queries() query: {},
		@Body() body: TranslationUpdateBodyInterface
	): Promise<PublicTranslationAttributes> {
		const translation = await this.translationRepository.update(translationId, body);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				translation.arn,
				`${this.appPrefix}:translations/update`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(translation.toJSON(), publicTranslationAttributes) as PublicTranslationAttributes),
			arn: translation.arn,
		};
	}
}
