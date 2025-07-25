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
	HashFields,
} from "@structured-growth/microservice-sdk";
import { JobAttributes } from "../../../database/models/job";
import { JobRepository } from "../../modules/jobs/job.repository";
import { JobSearchParamsInterface } from "../../interfaces/job-search-params.interface";
import { pick } from "lodash";
import { JobSearchParamsValidator } from "../../validators/job-search-params.validator";
import { JobReadParamsValidator } from "../../validators/job-read-params.validator";
import { JobDeleteParamsValidator } from "../../validators/job-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicJobAttributes = [
	"id",
	"orgId",
	"region",
	"createdAt",
	"updatedAt",
	"arn",
	"clientId",
	"translator",
	"status",
	"locales",
	"numberTokens",
	"numberTranslations",
	"launchType",
] as const;
type JobKeys = (typeof publicJobAttributes)[number];
type PublicJobAttributes = Pick<JobAttributes, JobKeys>;

@Route("v1/jobs")
@Tags("Jobs")
@autoInjectable()
export class JobsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("JobRepository") private jobRepository: JobRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Jobs
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of jobs")
	@DescribeAction("jobs/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Job", ({ query }) => query.id?.map(Number))
	@HashFields(["clientName"])
	@ValidateFuncArgs(JobSearchParamsValidator)
	async search(@Queries() query: JobSearchParamsInterface): Promise<SearchResultInterface<PublicJobAttributes>> {
		const { data, ...result } = await this.jobRepository.search(query);

		return {
			data: data.map((job) => ({
				...(pick(job.toJSON(), publicJobAttributes) as PublicJobAttributes),
				arn: job.arn,
			})),
			...result,
		};
	}

	/**
	 * Get Job
	 */
	@OperationId("Read")
	@Get("/:jobId")
	@SuccessResponse(200, "Returns job")
	@DescribeAction("jobs/read")
	@DescribeResource("Job", ({ params }) => Number(params.jobId))
	@HashFields(["clientName"])
	@ValidateFuncArgs(JobReadParamsValidator)
	async get(@Path() jobId: number): Promise<PublicJobAttributes> {
		const job = await this.jobRepository.read(jobId);

		if (!job) {
			throw new NotFoundError(`${this.i18n.__("error.job.name")} ${job} ${this.i18n.__("error.common.not_found")}`);
		}

		return {
			...(pick(job.toJSON(), publicJobAttributes) as PublicJobAttributes),
			arn: job.arn,
		};
	}

	/**
	 * Mark Job as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:jobId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("jobs/delete")
	@DescribeResource("Job", ({ params }) => Number(params.jobId))
	@ValidateFuncArgs(JobDeleteParamsValidator)
	async delete(@Path() jobId: number): Promise<void> {
		const job = await this.jobRepository.read(jobId);

		if (!job) {
			throw new NotFoundError(`${this.i18n.__("error.job.name")} ${jobId} ${this.i18n.__("error.common.not_found")}`);
		}

		await this.jobRepository.delete(jobId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, job.arn, `${this.appPrefix}:jobs/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
