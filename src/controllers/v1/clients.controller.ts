import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
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
import { pick } from "lodash";
import { ClientAttributes } from "../../../database/models/client";
import { ClientRepository } from "../../modules/clients/client.repository";
import { ClientService} from "../../modules/clients/client.service";
import { TokenService} from "../../modules/tokens/token.service";
import { ClientCreateBodyInterface } from "../../interfaces/client-create-body.interface";
import { ClientSearchParamsInterface } from "../../interfaces/client-search-params.interface";
import { ClientUpdateBodyInterface } from "../../interfaces/client-update-body.interface";
import { ClientCreateTranslationBodyInterface } from "../../interfaces/client-create-translation-body.interface";
import { ClientSearchParamsValidator } from "../../validators/client-search-params.validator";
import { ClientCreateParamsValidator } from "../../validators/client-create-params.validator";
import { ClientReadParamsValidator } from "../../validators/client-read-params.validator";
import { ClientUpdateParamsValidator } from "../../validators/client-update-params.validator";
import { ClientDeleteParamsValidator } from "../../validators/client-delete-params.validator";
import { ClientCreateTranslationParamsValidator} from "../../validators/client-create-translation-params.validator";
import {
	ClientGetLocalizedTranslationParamsValidator
} from "../../validators/client-get-localized-translation-params.validator";
import {
	ClientCreateDynamicTranslateBodyInterface
} from "../../interfaces/client-create-dynamic-translate-body.interface";
import {
	ClientCreateDynamicTranslateParamsValidator
} from "../../validators/client-create-dynamic-translate-params.validator";

const publicClientAttributes = [
	"id",
	"orgId",
	"region",
	"createdAt",
	"updatedAt",
	"status",
	"arn",
	"title",
	"clientName",
	"locales"
] as const;
type ClientKeys = (typeof publicClientAttributes)[number];
type PublicClientAttributes = Pick<ClientAttributes, ClientKeys>;

@Route("v1/clients")
@Tags("ClientsController")
@autoInjectable()
export class ClientsController extends BaseController {
	constructor(
		@inject("ClientRepository") private clientRepository: ClientRepository,
		@inject("ClientService") private clientService: ClientService,
		@inject("TokenService") private tokenService: TokenService
	) {
		super();
	}

	/**
	 * Search Clients
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of clients")
	@DescribeAction("clients/search")
	@DescribeResource("Organization", ({ query }) => String(query.orgId))
	@DescribeResource("Client", ({ query }) => Number(query.id))
	@ValidateFuncArgs(ClientSearchParamsValidator)
	async search(
		@Queries() query: ClientSearchParamsInterface
	): Promise<SearchResultInterface<PublicClientAttributes>> {
		const { data, ...result } = await this.clientRepository.search(query);

		return {
			data: data.map((client) => ({
				...(pick(client.toJSON(), publicClientAttributes) as PublicClientAttributes),
				arn: client.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Client.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created сlient")
	@DescribeAction("clients/create")
	@DescribeResource("Organization", ({ body }) => String(body.orgId))
	@ValidateFuncArgs(ClientCreateParamsValidator)
	async create(
		@Queries() query: {},
		@Body() body: ClientCreateBodyInterface
	): Promise<PublicClientAttributes> {
		const client = await this.clientService.create(body);
		this.response.status(201);

		return {
			...(pick(client.toJSON(), publicClientAttributes) as PublicClientAttributes),
			arn: client.arn,
		};
	}

	/**
	 * Get Client
	 */
	@OperationId("Read")
	@Get("/:clientId")
	@SuccessResponse(200, "Returns client")
	@DescribeAction("clients/read")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientReadParamsValidator)
	async get(@Path() clientId: number): Promise<PublicClientAttributes> {
		const client = await this.clientRepository.read(clientId);

		if (!client) {
			throw new NotFoundError(`Client ${client} not found`);
		}

		return {
			...(pick(client.toJSON(), publicClientAttributes) as PublicClientAttributes),
			arn: client.arn,
		};
	}

	/**
	 * Update Client
	 */
	@OperationId("Update")
	@Put("/:clientId")
	@SuccessResponse(200, "Returns updated сlient")
	@DescribeAction("clients/update")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientUpdateParamsValidator)
	async update(
		@Path() clientId: number,
		@Queries() query: {},
		@Body() body: ClientUpdateBodyInterface
	): Promise<PublicClientAttributes> {
		const client = await this.clientService.update(clientId, body);

		return {
			...(pick(client.toJSON(), publicClientAttributes) as PublicClientAttributes),
			arn: client.arn,
		};
	}

	/**
	 * Mark Client as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:clientId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("clients/delete")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientDeleteParamsValidator)
	async delete(@Path() clientId: number): Promise<void> {
		await this.clientRepository.delete(clientId);
		this.response.status(204);
	}

	/**
	 * Getting localized translations
	 */
	@OperationId("Read")
	@Get("/:clientId/:locale")
	@SuccessResponse(200, "Returns localized translations")
	@DescribeAction("clients/localized-translations")
	@DescribeResource("Client", ({ params }) => `${params.clientId}/${params.locale}`)
	@ValidateFuncArgs(ClientGetLocalizedTranslationParamsValidator)
	async getLocalizedMessages(
		@Path() clientId: number,
		@Path() locale: string,
	): Promise<object> {
		return await this.clientService.getLocalizedTranslation(clientId, locale);
	}

	/**
	 * Creating a translation with dynamic locales.
	 */
	@OperationId("Create")
	@Post("/:clientId/translate")
	@SuccessResponse(201, "Returns successful translations.")
	@DescribeAction("clients/translation/dynamic")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientCreateDynamicTranslateParamsValidator)
	async createTranslation(
		@Path() clientId: number,
		@Queries() query: {},
		@Body() body: ClientCreateDynamicTranslateBodyInterface
	): Promise<void> {
		await this.clientService.createJobTranslation(clientId, body);
	}

	/**
	 * Translation creation for the client.
	 */
	@OperationId("Create tokens from JSON")
	@Post("/:clientId/upload")
	@SuccessResponse(201, "Returns successful translations.")
	@DescribeAction("clients/translation/upload")
	@DescribeResource("Client", ({ params }) => Number(params.clientId))
	@ValidateFuncArgs(ClientCreateTranslationParamsValidator)
	async uploadTranslation(
		@Path() clientId: number,
		@Queries() query: {},
		@Body() body: ClientCreateTranslationBodyInterface
	): Promise<void> {
		await this.clientService.createFromJSON(clientId, body);

		this.response.status(201);
	}
}