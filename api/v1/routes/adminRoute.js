/* eslint-disable import/extensions */
import { Router } from 'express';
import { body } from 'express-validator';
import { AsyncMiddleware } from '../../../middlewares/index.js';
import Controller from '../controllers/Admin.js';

const admin = Controller();

const router = Router();

router.post(
  '/login',
  [
    body('email', "Failed! Email can't be blank")
      .exists()
      .bail()
      .isEmail()
      .withMessage('Invalid email format'),
    body('password', "Failed! Password can't be blank")
      .exists()
      .bail()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Password can't be empty"),
  ],
  AsyncMiddleware(admin.login),
);

export default router;
