'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "clients",
      Array(10)
        .fill(null)
        .map((i, index) => ({
          org_id: index + 1,
          region: "us",
          status: "active",
          title: "Client " + (index + 1),
          client_name: "client" + (index + 1),
          locales: ['en-US'],
          created_at: new Date(),
        })),
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("clients", null, {});
  }
};
