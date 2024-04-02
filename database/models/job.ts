import { ForeignKey, BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";
import Client from "./client";

export interface JobAttributes extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface> {
	clientId: number;
	translator: string;
	status: "completed" | "in_progress" | "error";
	locales: string[];
	numberTokens: number;
	numberTranslations: number;
	launchType: "admin" | "git";
}

export interface JobCreationAttributes
	extends Omit<JobAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface JobUpdateAttributes
	extends Partial<Pick<JobAttributes, "status" | "numberTokens" | "numberTranslations">> {}

@Table({
	tableName: "jobs",
	timestamps: true,
	underscored: true,
})
export class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	@ForeignKey(() => Client)
	clientId: number;

	@BelongsTo(() => Client)
	client: Client;

	@Column
	translator: string;

	@Column(DataType.STRING)
	status: JobAttributes["status"];

	@Column(DataType.ARRAY(DataType.STRING))
	locales: string[];

	@Column
	numberTokens: number;

	@Column
	numberTranslations: number;

	@Column(DataType.STRING)
	launchType: JobAttributes["launchType"];

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			"clients/<clientId>/jobs/<jobId>",
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			`-`,
			`clients/${this.clientId}/jobs/${this.id}`,
		].join(":");
	}
}

export default Job;
