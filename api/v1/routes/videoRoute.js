/* eslint-disable import/extensions */
import { Router } from 'express';
import { header, param } from 'express-validator';
import Controller from '../controllers/video.js';
import { videoUpload, multer } from '../../../utils/multerFileUpload.js';
import { SharedMiddleware, VideoMiddleware, AsyncMiddleware } from '../../../middlewares/index.js';

const video = Controller();

const router = Router();

router.post(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminOrUserToken(value)),
    videoUpload.single('video'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only video of type file, and title of type text are the expected form-data fields' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of video/mp4 file', err });
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      return next();
    }],
  AsyncMiddleware(video.Create),
);

router.get(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminToken(value)),
  ],
  AsyncMiddleware(video.All),
);

router.put(
  '/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value, { req }) => VideoMiddleware.isValidAdminOrUserAndVideo(value, req)),
    param('id')
      .isInt({ allow_leading_zeroes: false, min: 1, gt: 0 })
      .withMessage('Failed! id must be a number greater than 0 without leading zero')
      .bail()
      .not()
      .custom((value) => VideoMiddleware.isNewRecord(value))
      .withMessage('Failed! Invalid record'),
    videoUpload.single('video'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only video of type file, and title of type text are the expected form-data fields' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of video/mp4 file', err });
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      return next();
    }],
  AsyncMiddleware(video.Update),
);

router.delete(
  '/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value, { req }) => VideoMiddleware.isValidAdminOrUserAndVideo(value, req)),
    param('id')
      .isInt({ allow_leading_zeroes: false, min: 1, gt: 0 })
      .withMessage('Failed! id must be a number greater than 0 without leading zero')
      .bail()
      .not()
      .custom((value) => VideoMiddleware.isNewRecord(value))
      .withMessage('Failed! Invalid record'),
  ],
  AsyncMiddleware(video.Destroy),
);

export default router;
