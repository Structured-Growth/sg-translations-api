'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const clients = await queryInterface.sequelize.query(
      'SELECT id FROM clients',
    );

    const jobsData = clients[0].map((client, index) => ({
      org_id: index + 1,
      region: "us",
      client_id: client.id,
      translator: "aws",
      status: "inProgress",
      locales: ['en-US'],
      number_tokens: index + 1,
      number_translations: index + 1,
      launch_type: "git",
      created_at: new Date(),
    }));

    await queryInterface.bulkInsert("jobs", jobsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jobs", null, {});
  }
};

