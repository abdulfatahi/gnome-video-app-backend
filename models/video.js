import pkg from 'sequelize';

const { Model } = pkg;

export default (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
      Video.belongsTo(models.user);
    }

    createRepresenter() {
      return {
        video: this.video,
        title: this.title,
        id: this.id,
      };
    }
  }

  Video.init(
    {
      video: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      cloudinary_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      UserId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'Video',
    },
  );
  return Video;
};
