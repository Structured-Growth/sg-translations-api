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
	I18nType,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { ClientAttributes } from "../../../database/models/client";
import { ClientRepository } from "../../modules/clients/client.repository";
import { ClientService } from "../../modules/clients/client.service";
import { ClientCreateBodyInterface } from "../../interfaces/client-create-body.interface";
import { ClientSearchParamsInterface } from "../../interfaces/client-search-params.interface";
import { ClientUpdateBodyInterface } from "../../interfaces/client-update-body.interface";
import { ClientSearchParamsValidator } from "../../validators/client-search-params.validator";
import { ClientCreateParamsValidator } from "../../validators/client-create-params.validator";
import { ClientReadParamsValidator } from "../../validators/client-read-params.validator";
import { ClientUpdateParamsValidator } from "../../validators/client-update-params.validator";
import { ClientDeleteParamsValidator } from "../../validators/client-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

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
	"locales",
	"defaultLocale",
] as const;
type ClientKeys = (typeof publicClientAttributes)[number];
type PublicClientAttributes = Pick<ClientAttributes, ClientKeys>;

@Route("v1/clients")
@Tags("Clients")
@autoInjectable()
export class ClientsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("ClientRepository") private clientRepository: ClientRepository,
		@inject("ClientService") private clientService: ClientService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Clients
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of clients")
	@DescribeAction("clients/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Client", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(ClientSearchParamsValidator)
	async search(@Queries() query: ClientSearchParamsInterface): Promise<SearchResultInterface<PublicClientAttributes>> {
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
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@ValidateFuncArgs(ClientCreateParamsValidator)
	async create(@Queries() query: {}, @Body() body: ClientCreateBodyInterface): Promise<PublicClientAttributes> {
		const client = await this.clientService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, client.arn, `${this.appPrefix}:clients/create`, JSON.stringify(body))
		);

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
			throw new NotFoundError(
				`${this.i18n.__("error.client.name")} ${client} ${this.i18n.__("error.common.not_found")}`
			);
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
		const client = await this.clientRepository.update(clientId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, client.arn, `${this.appPrefix}:clients/update`, JSON.stringify(body))
		);

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
		const client = await this.clientRepository.read(clientId);

		if (!client) {
			throw new NotFoundError(
				`${this.i18n.__("error.client.name")} ${clientId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		await this.clientRepository.delete(clientId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, client.arn, `${this.appPrefix}:clients/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
