/* eslint-disable import/extensions */
import { Router } from 'express';
import { header, param } from 'express-validator';
import Controller from '../controllers/Audio.js';
import { audioUpload, multer } from '../../../utils/multerFileUpload.js';
import { SharedMiddleware, AudioMiddleware, AsyncMiddleware } from '../../../middlewares/index.js';

const audio = Controller();

const router = Router();

router.post(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminOrUserToken(value)),
    audioUpload.single('audio'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only audio of type file, and title of type text are the expected form-data fields' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of audio/mpeg or audio/mp3 file', err });
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      return next();
    }],
  AsyncMiddleware(audio.Create),
);

router.get(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminToken(value)),
  ],
  AsyncMiddleware(audio.All),
);

router.put(
  '/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value, { req }) => AudioMiddleware.isValidAdminOrUserAndAudio(value, req)),
    param('id')
      .isInt({ allow_leading_zeroes: false, min: 1, gt: 0 })
      .withMessage('Failed! id must be a number greater than 0 without leading zero')
      .bail()
      .not()
      .custom((value) => AudioMiddleware.isNewRecord(value))
      .withMessage('Failed! Invalid record'),
    audioUpload.single('audio'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only video of type file, and title of type text are the expected form-data fields' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of video/mp4 file', err });
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      return next();
    }],
  AsyncMiddleware(audio.Update),
);

router.delete(
  '/:id',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value, { req }) => AudioMiddleware.isValidAdminOrUserAndAudio(value, req)),
    param('id')
      .isInt({ allow_leading_zeroes: false, min: 1, gt: 0 })
      .withMessage('Failed! id must be a number greater than 0 without leading zero')
      .bail()
      .not()
      .custom((value) => AudioMiddleware.isNewRecord(value))
      .withMessage('Failed! Invalid record'),
  ],
  AsyncMiddleware(audio.Destroy),
);

export default router;
