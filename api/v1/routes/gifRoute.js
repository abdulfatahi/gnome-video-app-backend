/* eslint-disable import/extensions */
import { Router } from 'express';
import { header } from 'express-validator';
import Controller from '../controllers/Gif.js';
import { gifUpload, multer } from '../../../utils/multerFileUpload.js';
import { SharedMiddleware, AsyncMiddleware } from '../../../middlewares/index.js';

const gif = Controller();

const router = Router();

router.post(
  '/',
  [
    header('authorization', 'Please specify an authorization header')
      .exists()
      .bail()
      .custom((value) => SharedMiddleware.isValidAdminOrUserToken(value)),
    gifUpload.single('gif'),
    (err, _, res, next) => {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: 'Only gif of type file is the expected form-data field' });
      if (err.message === 'Unsupported File Format') return res.status(400).json({ message: 'Only mimetype of image/gif file', err });
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      return next();
    }],
  AsyncMiddleware(gif.Create),
);

export default router;
