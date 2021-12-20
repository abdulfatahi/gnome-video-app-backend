/* eslint-disable import/extensions */
import { Router } from 'express';
import {
  body, header, param, query,
} from 'express-validator';
import { SharedMiddleware, AsyncMiddleware } from '../../../middlewares/index.js';
import Controller from '../controllers/User.js';

const user = Controller();

const router = Router();

router.post(
  '/signup',
  body('firstName', 'Failed! First Name cannot be blank')
    .exists()
    .bail()
    .isString()
    .withMessage('Failed! First Name must be a string')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Minimum of 3 and max of 10 characters'),
  body('lastName', 'Failed! Last Name cannot be blank')
    .exists()
    .bail()
    .isString()
    .withMessage('Failed! Last Name must be a string')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Minimum of 3 and max of 10 characters'),
  body('email', 'Email cannot be blank')
    .exists()
    .bail()
    .isEmail()
    .withMessage('Failed! Invalid email format')
    .custom((email) => SharedMiddleware.isUniqueEmail(email)),
  body('password', "Failed! Password can't be blank")
    .exists()
    .bail()
    .isString()
    .withMessage('Failed! Password must be a string')
    .isStrongPassword()
    .withMessage(
      'Weak Password, allowed format is: {minLength: 8, minSymbol: 1, minUpperCase: 1, minLowerCase: 1}',
    ),
  AsyncMiddleware(user.signUp),
);

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
  AsyncMiddleware(user.login),
);

router.get('/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminToken(value)),
    query('page')
      .optional().isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage('page must be an integer greater than 0 without leading zero. Kindly omit page query for page zero'),
    query('size')
      .optional().isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage('size must be an integer greater than 0 without leading zero.'),
    query('search')
      .optional().isString().withMessage('Failed! Search must be a string')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Search cant be empty'),
  ],
  AsyncMiddleware(user.getAllUsers));

router.put('/status/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminToken(value)),
    body('status', 'Status can not be blank')
      .exists()
      .isBoolean()
      .withMessage('must be a boolean value'),
    param('id')
      .exists()
      .isInt({ allow_leading_zeroes: false, min: 1 })
      .withMessage('id must be an integer greater than 0 without leading 0'),
  ],
  AsyncMiddleware(user.statusUpdate));

router.get('/:id', AsyncMiddleware(user.getOneUser));

router.put(
  '/update/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidUserToken(value)),
    body('firstName', 'Failed! First Name cannot be blank')
      .optional()
      .isString()
      .withMessage('Failed. First name must be a string')
      .trim()
      .isLength({ min: 4, max: 10 })
      .withMessage('Minimum of 4 and maximum of 10 characters'),
    body('lastName', 'Failed! Last Name cannot be blank')
      .optional()
      .isString()
      .withMessage('Failed. Last name must be a string')
      .trim()
      .isLength({ min: 4, max: 10 })
      .withMessage('Minimum of 4 and maximum of 10 characters'),
    body('email', "Failed! Email can't be blank")
      .optional()
      .isEmail()
      .withMessage('Invalid email format')
      .custom((email) => SharedMiddleware.isUniqueEmail(email)),
    body('password', "Failed! Password can't be blank")
      .optional()
      .isStrongPassword()
      .withMessage(
        'Weak password, allowed format is { minLength: 8, minLowerCase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}',
      ),
  ],
  AsyncMiddleware(user.update),
);

router.delete('/delete/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminToken(value)),
    param('id')
      .exists()
      .isInt({ allow_leading_zeroes: false, min: 1 })
      .withMessage('id must be an integer greater than 0 without leading 0'),
  ],
  AsyncMiddleware(user.deleteUser));

router.post(
  '/forgot-password',
  [
    body('email', 'Failed! Email cant be blank')
      .exists()
      .bail()
      .isEmail()
      .withMessage('Invalid Email format'),
  ],
  AsyncMiddleware(user.forgetPassword),
);

router.post(
  '/reset-password/:userId/:token',
  [
    param('userId')
      .exists()
      .isInt({ allow_leading_zeroes: false })
      .withMessage('userId must be an integer greater than 0 without leading 0'),
    param('token')
      .exists()
      .isString()
      .withMessage('Failed! token must be a string')
      .trim()
      .isLength({ min: 4 })
      .withMessage('Minimum of 4 characters'),
    body('password', "Failed! Password can't be blank")
      .exists()
      .bail()
      .isString()
      .withMessage('Failed! Password must be a string')
      .isStrongPassword()
      .withMessage(
        'Weak Password, allowed format is: {minLength: 8, minSymbol: 1, minUpperCase: 1, minLowerCase: 1}',
      ),
  ],
  AsyncMiddleware(user.passwordReset),
);

export default router;
