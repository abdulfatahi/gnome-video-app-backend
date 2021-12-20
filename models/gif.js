import pkg from 'sequelize';

const { Model } = pkg;

export default (sequelize, DataTypes) => {
  class Gif extends Model {
    static associate(models) {
      Gif.belongsTo(models.user);
    }

    createRepresenter() {
      return {
        gif: this.gif,
        id: this.id,
      };
    }
  }

  Gif.init(
    {
      gif: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      cloudinary_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      UserId: {
        type: DataTypes.INTEGER,
      },
    }, {
      sequelize,
      modelName: 'Gif',
    },
  );
  return Gif;
};
