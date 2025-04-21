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
import { TokenRepository } from "../../modules/tokens/token.repository";
import { TokenSearchParamsInterface } from "../../interfaces/token-search-params.interface";
import { pick } from "lodash";
import { TokenAttributes } from "../../../database/models/token";
import { TokenSearchParamsValidator } from "../../validators/token-search-params.validator";
import { TokenReadParamsValidator } from "../../validators/token-read-params.validator";

const publicTokenAttributes = ["id", "orgId", "region", "createdAt", "updatedAt", "arn", "clientId", "token"] as const;
type TokenKeys = (typeof publicTokenAttributes)[number];
type PublicTokenAttributes = Pick<TokenAttributes, TokenKeys>;

@Route("v1/tokens")
@Tags("Tokens")
@autoInjectable()
export class TokensController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("TokenRepository") private tokenRepository: TokenRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Tokens
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of tokens")
	@DescribeAction("tokens/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Client", ({ query }) => Number(query.clientId))
	@DescribeResource("Token", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(TokenSearchParamsValidator)
	async search(@Queries() query: TokenSearchParamsInterface): Promise<SearchResultInterface<PublicTokenAttributes>> {
		const { data, ...result } = await this.tokenRepository.search(query);

		return {
			data: data.map((token) => ({
				...(pick(token.toJSON(), publicTokenAttributes) as PublicTokenAttributes),
				arn: token.arn,
			})),
			...result,
		};
	}

	/**
	 * Get Token
	 */
	@OperationId("Read")
	@Get("/:tokenId")
	@SuccessResponse(200, "Returns token")
	@DescribeAction("tokens/read")
	@DescribeResource("Token", ({ params }) => Number(params.tokenId))
	@ValidateFuncArgs(TokenReadParamsValidator)
	async get(@Path() tokenId: number): Promise<PublicTokenAttributes> {
		const token = await this.tokenRepository.read(tokenId);

		if (!token) {
			throw new NotFoundError(`${this.i18n.__("error.token.name")} ${token} ${this.i18n.__("error.common.not_found")}`);
		}

		return {
			...(pick(token.toJSON(), publicTokenAttributes) as PublicTokenAttributes),
			arn: token.arn,
		};
	}
}
