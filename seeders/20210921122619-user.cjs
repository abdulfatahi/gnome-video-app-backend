const Faker = require('faker');
const bcrypt = require('bcryptjs');

const password = bcrypt.hashSync(process.env.customer_password, bcrypt.genSaltSync(10));

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          firstName: Faker.name.firstName(),
          lastName: Faker.name.lastName(),
          paid: true,
          email: 'southbay1@gmail.com',
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: Faker.name.firstName(),
          lastName: Faker.name.lastName(),
          paid: true,
          email: 'southbay2@gmail.com',
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: Faker.name.firstName(),
          lastName: Faker.name.lastName(),
          paid: true,
          email: 'southbay3@gmail.com',
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
