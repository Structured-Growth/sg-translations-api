'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tokens = await queryInterface.sequelize.query(
      'SELECT id, client_id FROM tokens',
    );

    const translationsData = tokens[0].map((token, index) => ({
      org_id: index + 1,
      region: "us",
      token_id: token.id,
      locale: "en-US",
      text: "Some translation text for token " + token.id,
      client_id: token.client_id,
      created_at: new Date(),
    }));

    await queryInterface.bulkInsert("translations", translationsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("translations", null, {});
  }
};

