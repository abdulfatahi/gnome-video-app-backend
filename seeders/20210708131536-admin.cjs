const bcrypt = require('bcryptjs');

const password = bcrypt.hashSync(process.env.admin_password, bcrypt.genSaltSync(10));

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Admins', [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'example@example.com',
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Admins', null, {}),
};
