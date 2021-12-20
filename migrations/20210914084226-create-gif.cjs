module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Gifs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      gif: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      cloudinary_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      UserId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Gifs');
  },
};
