/* eslint-disable import/extensions */
import { Router } from 'express';
import { header, param } from 'express-validator';
import Controller from '../controllers/Image.js';
import { imageUpload, multer } from '../../../utils/multerFileUpload.js';
import { SharedMiddleware, AsyncMiddleware, ImageMiddleware } from '../../../middlewares/index.js';

const image = Controller();

const router = Router();

router.post(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminOrUserToken(value)),
    imageUpload.single('image'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only image of type file is the expected form-data field' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of image/png or image/jpg or image/svg or image/jpeg file', err });
      return next();
    }],
  AsyncMiddleware(image.Create),
);

router.get(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminToken(value)),
  ],
  AsyncMiddleware(image.All),
);

router.put(
  '/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value, { req }) => ImageMiddleware.isValidAdminOrUserAndImage(value, req)),
    param('id')
      .isInt({ allow_leading_zeroes: false, min: 1, gt: 0 })
      .withMessage('Failed! id must be a number greater than 0 without leading zero')
      .bail()
      .not()
      .custom((value) => ImageMiddleware.isNewRecord(value))
      .withMessage('Failed! Invalid record'),
    imageUpload.single('image'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only video of type file, and title of type text are the expected form-data fields' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of video/mp4 file', err });
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      return next();
    }],
  AsyncMiddleware(image.Update),
);

router.delete(
  '/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value, { req }) => ImageMiddleware.isValidAdminOrUserAndImage(value, req)),
    param('id')
      .isInt({ allow_leading_zeroes: false, min: 1, gt: 0 })
      .withMessage('Failed! id must be a number greater than 0 without leading zero')
      .bail()
      .not()
      .custom((value) => ImageMiddleware.isNewRecord(value))
      .withMessage('Failed! Invalid record'),
  ],
  AsyncMiddleware(image.Destroy),
);

export default router;
