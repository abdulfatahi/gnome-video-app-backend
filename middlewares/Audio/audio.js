/* eslint-disable import/extensions */
/*
/* Exported list of custom middleware functions used along side express validator
 */

import jwt from 'jsonwebtoken';

import db from '../../models/index.js';

const { admin: Admin, user: User, audio: Audio } = db;

const isValidAdminOrUserAndAudio = async (value, req) => {
  const isAudio = await Audio.findByPk(req.params.id, { attributes: ['isDefault'], include: 'User' });
  if (!isAudio) throw new Error('Unauthorized!');

  const token = value.split(' ')[1];
  const tokenData = jwt.verify(token, process.env.SECRET);
  if (!tokenData) throw new Error(tokenData);

  const isUser = await User.findOne({
    where: { email: tokenData.email },
  });

  if (isUser) {
    if (isAudio.isDefault) throw new Error('Unauthorized!');
    if (isAudio.User.id !== isUser.id) throw new Error('Unauthorized!');
    return true;
  }
  const isAdmin = await Admin.findOne({
    where: { email: tokenData.email },
  });
  if (!isAdmin) throw new Error('Unauthorized!');
  if (!isAudio.isDefault) throw new Error('Only a user can alter is his/her Audio!');
  if (isAudio.isDefault) return true;

  return false;
};

const isNewRecord = async (id) => {
  const isAudio = await Audio.findByPk(id);

  if (isAudio) throw new Error('Failed! Record is already exits');

  return true;
};

export default {
  isValidAdminOrUserAndAudio,
  isNewRecord,
};
