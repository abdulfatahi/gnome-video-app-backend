/* eslint-disable import/extensions */
/*
/* Exported list of custom middleware functions used along side express validator
 */

import jwt from 'jsonwebtoken';

import db from '../../models/index.js';

const { admin: Admin, user: User, image: Image } = db;

const isValidAdminOrUserAndImage = async (value, req) => {
  const isImage = await Image.findByPk(req.params.id, { attributes: ['isDefault'], include: 'User' });
  if (!isImage) throw new Error('Unauthorized!');

  const token = value.split(' ')[1];
  const tokenData = jwt.verify(token, process.env.SECRET);
  if (!tokenData) throw new Error(tokenData);

  const isUser = await User.findOne({
    where: { email: tokenData.email },
  });

  if (isUser) {
    if (isImage.isDefault) throw new Error('Unauthorized!');
    if (isImage.User.id !== isUser.id) throw new Error('Unauthorized!');
    return true;
  }
  const isAdmin = await Admin.findOne({
    where: { email: tokenData.email },
  });
  if (!isAdmin) throw new Error('Unauthorized!');
  if (!isImage.isDefault) throw new Error('Only a user can alter is his/her Image!');
  if (isImage.isDefault) return true;

  return false;
};

const isNewRecord = async (id) => {
  const isImage = await Image.findByPk(id);

  if (isImage) throw new Error('Failed! Record is already exits');

  return true;
};

export default {
  isValidAdminOrUserAndImage,
  isNewRecord,
};
