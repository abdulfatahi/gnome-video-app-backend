import pkg from 'sequelize';

const { Model } = pkg;

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.token);
      User.hasMany(models.audio);
      User.hasMany(models.video);
      User.hasMany(models.image);
      User.hasMany(models.gif);
    }

    representer() {
      return {
        id: this.id,
        firstname: this.firstName,
        lastname: this.lastName,
        email: this.email,
        paid: this.paid,
        audios: this.Audios,
        videos: this.Videos,
        images: this.Images,
        gifs: this.Gifs,
      };
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'User' },
  );
  return User;
};
