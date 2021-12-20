/* eslint-disable import/extensions */
import Sequelize from 'sequelize';
import enVariables from '../config/config.cjs';
import user from './user.js';
import admin from './admin.js';
import token from './token.js';
import video from './video.js';
import audio from './audio.js';
import gif from './gif.js';
import image from './image.js';

const env = process.env.NODE_ENV || 'development';
const config = enVariables[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = user(sequelize, Sequelize);
db.admin = admin(sequelize, Sequelize);
db.token = token(sequelize, Sequelize);
db.video = video(sequelize, Sequelize);
db.audio = audio(sequelize, Sequelize);
db.gif = gif(sequelize, Sequelize);
db.image = image(sequelize, Sequelize);

// Associations
if (db.user.associate) { db.user.associate(db); }

if (db.admin.associate) { db.admin.associate(db); }

if (db.token.associate) { db.token.associate(db); }

if (db.video.associate) { db.video.associate(db); }

if (db.audio.associate) { db.audio.associate(db); }

if (db.gif.associate) { db.gif.associate(db); }

if (db.image.associate) { db.image.associate(db); }

export default db;
