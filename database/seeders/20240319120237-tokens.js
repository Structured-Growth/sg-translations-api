'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const clients = await queryInterface.sequelize.query(
      'SELECT id FROM clients',
    );

    const tokensData = clients[0].map((client, index) => ({
      org_id: index + 1,
      region: "us",
      token: "some_token_for_client_" + client.id,
      client_id: client.id,
      created_at: new Date(),
    }));

    await queryInterface.bulkInsert("tokens", tokensData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tokens", null, {});
  }
};

