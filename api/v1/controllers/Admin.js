/* eslint-disable import/extensions */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import db from '../../../models/index.js';

const AdminModel = db.admin;

export default () => {
  const login = async (req, res) => {
    // check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Query for the unique admin
    const Admin = await AdminModel.findOne({
      where: { email: req.body.email },
    });

    if (!Admin) return res.status(422).json({ message: 'Invalid login details' });

    // compare Admin's password to log the Admin in
    const isValidPassword = await bcrypt.compare(req.body.password, Admin.password);
    if (!isValidPassword) return res.status(422).json({ message: 'Invalid Login details' });

    // Generate admin token
    const token = jwt.sign({ email: Admin.email }, process.env.SECRET, {
      expiresIn: '20d',
    });
    return res.status(200).json({ ...Admin.representer(), token });
  };

  return {
    login,
  };
};
