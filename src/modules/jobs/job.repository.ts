import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import Job, { JobCreationAttributes, JobUpdateAttributes } from "../../../database/models/job";
import { JobSearchParamsInterface } from "../../interfaces/job-search-params.interface";

@autoInjectable()
export class JobRepository implements RepositoryInterface<Job, JobSearchParamsInterface, JobCreationAttributes> {
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: JobSearchParamsInterface): Promise<SearchResultInterface<Job>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.clientId && (where["clientId"] = params.clientId);
		params.translator && (where["translator"] = { [Op.in]: params.translator });
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });
		params.launchType && (where["launchType"] = { [Op.in]: params.launchType });
		params.locales && (where["locales"] = { [Op.contains]: params.locales });

		const { rows, count } = await Job.findAndCountAll({
			where,
			offset,
			limit,
			order,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: JobCreationAttributes): Promise<Job> {
		return Job.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Job | null> {
		return Job.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: JobUpdateAttributes): Promise<Job> {
		const job = await this.read(id);

		if (!job) {
			throw new NotFoundError(`${this.i18n.__("error.job.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
		job.setAttributes(params);

		return job.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Job.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`${this.i18n.__("error.job.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
	}
}
