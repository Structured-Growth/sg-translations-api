import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";

export interface ClientAttributes extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface> {
	status: "active" | "inactive" | "archived";
	title: string;
	clientName: string;
	locales: string[];
	defaultLocale: string;
	metadata: Record<string, unknown>;
}

export interface ClientCreationAttributes
	extends Omit<ClientAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt" | "metadata"> {
	metadata?: Record<string, unknown>;
}

export interface ClientUpdateAttributes
	extends Partial<
		Pick<ClientCreationAttributes, "status" | "title" | "clientName" | "locales" | "defaultLocale" | "metadata">
	> {}

@Table({
	tableName: "clients",
	timestamps: true,
	underscored: true,
})
export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column(DataType.STRING)
	status: ClientAttributes["status"];

	@Column
	title: string;

	@Column
	clientName: string;

	@Column(DataType.ARRAY(DataType.STRING))
	locales: string[];

	@Column
	defaultLocale: string;

	@Column(DataType.JSONB)
	metadata: Record<string, unknown>;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "-", "clients/<clientId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, `-`, `clients/${this.id}`].join(":");
	}
}

export default Client;
