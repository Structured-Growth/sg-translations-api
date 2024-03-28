'use strict';

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable("clients", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      client_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      locales: {
        type: Sequelize.ARRAY(Sequelize.STRING(15)),
        allowNull: false,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable("clients");
  }
};
