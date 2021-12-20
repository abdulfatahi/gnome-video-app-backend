/* eslint-disable import/extensions */
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import db from '../../models/index.js';

const { user: Client, admin: Admin } = db;

const isUniqueEmail = async (email) => {
  const isClientEmail = await Client.findOne({
    where: { email },
  });
  const isAdminEmail = await Admin.findOne({
    where: { email },
  });

  if (isClientEmail || isAdminEmail) throw new Error('Failed! Email is already in use');

  return true;
};

// const isValidUserToken = async (value) => {
//   const token = value.split(' ')[1];
//   const tokenData = jwt.verify(token, process.env.SECRET);
//   if (!tokenData) throw new Error(tokenData);
//   return true;
// };

// eslint-disable-next-line consistent-return
const validateResult = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(422).json({ errors: error.array() });
};

const isValidAdminToken = async (value) => {
  const token = value.split(' ')[1];
  const tokenData = jwt.verify(token, process.env.SECRET);
  if (!tokenData) throw new Error(tokenData);

  const isAdmin = await Admin.findOne({
    where: { email: tokenData.email },
  });
  if (!isAdmin) throw new Error('Unauthorized!');

  return true;
};

const isValidAdminOrUserToken = async (value) => {
  const token = value.split(' ')[1];
  const tokenData = jwt.verify(token, process.env.SECRET);
  if (!tokenData) throw new Error(tokenData);

  const isAdmin = await Admin.findOne({
    where: { email: tokenData.email },
  });

  const isClient = await Client.findOne({
    where: { email: tokenData.email },
  });

  if (isAdmin || isClient) return true;

  throw new Error('Unauthorized!');
};

export default {
  isUniqueEmail,
  // isValidUserToken,
  validateResult,
  isValidAdminToken,
  isValidAdminOrUserToken,
};
