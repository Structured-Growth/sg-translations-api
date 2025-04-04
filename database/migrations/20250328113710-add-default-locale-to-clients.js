"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		const schema = process.env.DB_SCHEMA;

		await queryInterface.addColumn({ schema, tableName: "clients" }, "default_locale", {
			type: Sequelize.STRING(15),
			allowNull: false,
			defaultValue: "en-US",
		});

		await queryInterface.changeColumn({ schema, tableName: "clients" }, "default_locale", {
			type: Sequelize.STRING(15),
			allowNull: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn({ schema: process.env.DB_SCHEMA, tableName: "clients" }, "default_locale");
	},
};
