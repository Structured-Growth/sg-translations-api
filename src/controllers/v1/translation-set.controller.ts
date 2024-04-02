import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { ClientRepository } from "../../modules/clients/client.repository";
import { ClientService } from "../../modules/clients/client.service";
import { ClientCreateTranslationBodyInterface } from "../../interfaces/client-create-translation-body.interface";
import { ClientCreateDynamicTranslateBodyInterface } from "../../interfaces/client-create-dynamic-translate-body.interface";
import { ClientCreateTranslationParamsValidator } from "../../validators/client-create-translation-params.validator";
import { ClientGetLocalizedTranslationParamsValidator } from "../../validators/client-get-localized-translation-params.validator";
import { ClientCreateDynamicTranslateParamsValidator } from "../../validators/client-create-dynamic-translate-params.validator";

@Route("v1/translation-set")
@Tags("Translation set")
@autoInjectable()
export class TranslationSetController extends BaseController {
	constructor(
		@inject("ClientRepository") private clientRepository: ClientRepository,
		@inject("ClientService") private clientService: ClientService
	) {
		super();
	}

	/**
	 * Get translation set for a specified client and locale.
	 * Should be used as a source in a client application.
	 */
	@OperationId("Get a translation set")
	@Get("/:clientId/:locale")
	@SuccessResponse(200, "Returns translation set")
	@DescribeAction("translation-set/get")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientGetLocalizedTranslationParamsValidator)
	async getTranslationSet(@Path() clientId: number, @Path() locale: string): Promise<{ [key: string]: any }> {
		return await this.clientService.getLocalizedTranslation(clientId, locale);
	}

	/**
	 * Translate a set into the specified languages using machine translator.
	 */
	@OperationId("Translate a set")
	@Post("/:clientId/translate")
	@SuccessResponse(204, "Success")
	@DescribeAction("translation-set/translate")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientCreateDynamicTranslateParamsValidator)
	async translate(
		@Path() clientId: number,
		@Queries() query: {},
		@Body() body: ClientCreateDynamicTranslateBodyInterface
	): Promise<void> {
		await this.clientService.createJobTranslation(clientId, body);
		this.response.status(204);
	}

	/**
	 * Create a translation set for the specified client
	 */
	@OperationId("Create a set")
	@Post("/:clientId/upload")
	@SuccessResponse(204, "Success")
	@DescribeAction("clients/translation/upload")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientCreateTranslationParamsValidator)
	async uploadTranslation(
		@Path() clientId: number,
		@Queries() query: {},
		@Body() body: ClientCreateTranslationBodyInterface
	): Promise<void> {
		await this.clientService.createFromJSON(clientId, body);
		this.response.status(204);
	}
}
