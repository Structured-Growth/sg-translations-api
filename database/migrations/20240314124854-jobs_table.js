"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "jobs",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				region: {
					type: Sequelize.STRING(10),
					allowNull: false,
				},
				org_id: {
					type: Sequelize.INTEGER,
					allowNull: false,
				},
				client_id: {
					type: Sequelize.INTEGER,
					references: {
						model: "clients",
						key: "id",
					},
					onDelete: "RESTRICT",
				},
				translator: {
					type: Sequelize.STRING(20),
					allowNull: false,
				},
				status: {
					type: Sequelize.STRING(15),
					allowNull: false,
				},
				locales: {
					type: Sequelize.ARRAY(Sequelize.STRING(15)),
					allowNull: false,
				},
				number_tokens: Sequelize.INTEGER,
				number_translations: Sequelize.INTEGER,
				launch_type: Sequelize.STRING(10),
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable({
			schema: process.env.DB_SCHEMA,
			tableName: "jobs",
		});
	},
};
