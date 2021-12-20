/* eslint-disable import/extensions */
/*
/* Exported list of custom middleware functions used along side express validator
 */

import jwt from 'jsonwebtoken';

import db from '../../models/index.js';

const { admin: Admin, user: User, video: Video } = db;

const isValidAdminOrUserAndVideo = async (value, req) => {
  const isVideo = await Video.findByPk(req.params.id, { attributes: ['isDefault'], include: 'User' });
  if (!isVideo) throw new Error('Unauthorized!');

  const token = value.split(' ')[1];
  const tokenData = jwt.verify(token, process.env.SECRET);
  if (!tokenData) throw new Error(tokenData);

  const isUser = await User.findOne({
    where: { email: tokenData.email },
  });

  if (isUser) {
    if (isVideo.isDefault) throw new Error('Unauthorized!');
    if (isVideo.User.id !== isUser.id) throw new Error('Unauthorized!');
    return true;
  }
  const isAdmin = await Admin.findOne({
    where: { email: tokenData.email },
  });
  if (!isAdmin) throw new Error('Unauthorized!');
  if (!isVideo.isDefault) throw new Error('Only a user can alter is his/her video!');
  if (isVideo.isDefault) return true;

  return false;
};

const isNewRecord = async (id) => {
  const isVideo = await Video.findByPk(id);

  if (isVideo) throw new Error('Failed! Record is already exits');

  return true;
};

export default {
  isValidAdminOrUserAndVideo,
  isNewRecord,
};
