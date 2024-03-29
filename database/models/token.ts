import { ForeignKey, BelongsTo, Column, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";
import Client from "./client";

export interface TokenAttributes extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface> {
	token: string;
	clientId: number;
}

export interface TokenCreationAttributes
	extends Omit<TokenAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

@Table({
	tableName: "tokens",
	timestamps: true,
	underscored: true,
})
export class Token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	token: string;

	@Column
	@ForeignKey(() => Client)
	clientId: number;

	@BelongsTo(() => Client)
	client: Client;

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			"clients/<clientId>/tokens/<tokenId>",
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			`-`,
			`clients/${this.clientId}/tokens/${this.id}`,
		].join(":");
	}
}

export default Token;
