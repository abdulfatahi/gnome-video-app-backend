import pkg from 'sequelize';

const { Model } = pkg;

export default (sequelize, DataTypes) => {
  class Audio extends Model {
    static associate(models) {
      Audio.belongsTo(models.user);
    }

    createRepresenter() {
      return {
        audio: this.audio,
        title: this.title,
        id: this.id,
      };
    }
  }

  Audio.init({
    audio: {
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
  }, {
    sequelize,
    modelName: 'Audio',
  });
  return Audio;
};
