import pkg from 'sequelize';

const { Model } = pkg;

export default (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.user);
    }

    createRepresenter() {
      return {
        image: this.image,
        id: this.id,
      };
    }
  }

  Image.init(
    {
      image: {
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
      modelName: 'Image',
    },
  );
  return Image;
};
