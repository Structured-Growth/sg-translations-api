import { ForeignKey, BelongsTo, Column, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";
import Token from "./token";
import Client from "./client";

export interface TranslationAttributes extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface> {
	tokenId: number;
	clientId: number;
	locale: string;
	text: string;
}

export interface TranslationCreationAttributes
	extends Omit<TranslationAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface TranslationUpdateAttributes extends Partial<Pick<TranslationAttributes, "text">> {}

@Table({
	tableName: "translations",
	timestamps: true,
	underscored: true,
})
export class Translation
	extends Model<TranslationAttributes, TranslationCreationAttributes>
	implements TranslationAttributes
{
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	@ForeignKey(() => Token)
	tokenId: number;

	@BelongsTo(() => Token)
	token: Token;

	@Column
	@ForeignKey(() => Client)
	clientId: number;

	@BelongsTo(() => Client)
	client: Client;

	@Column
	locale: string;

	@Column
	text: string;

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			"clients/<clientId>/tokens/<tokenId>/translations/<translationId>",
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			`-`,
			`clients/${this.clientId}/tokens/${this.tokenId}/translations/${this.id}`,
		].join(":");
	}
}

export default Translation;
