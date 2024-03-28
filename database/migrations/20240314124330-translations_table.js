'use strict';

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable("translations", {
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "tokens",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      locale: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT,
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
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable("translations");
  }
};
