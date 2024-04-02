"use strict";

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable("tokens", {
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
			token: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("tokens");
	},
};
