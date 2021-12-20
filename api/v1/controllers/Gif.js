/* eslint-disable import/extensions */
import fs from 'fs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import db from '../../../models/index.js';
import cloudinary from '../../../lib/cloudConfig.js';

const { gif: GifModel, user: User } = db;

export default () => {
  // Creating a new video record
  const Create = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.status(422).json({ errors: error.array() });
    if (!req.file) return res.status(400).json({ message: 'gif required' });

    const { path, filename } = req.file; // file becomes available in req at this point
    // Upload Video to Cloudinary
    const isUploaded = await cloudinary.uploader.upload(
      path,
      {
        public_id: `GifUploads/${filename}`,
      },
    );
    if (!isUploaded) return res.status(500).json({ isUploaded });

    await fs.unlinkSync(path);

    // decode admin/user email
    const tokenData = jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.SECRET,
    );

    // Query for the unique user
    const isUser = await User.findOne({
      where: { email: tokenData.email },
    });

    const gifCreateObject = {
      gif: isUploaded.secure_url,
      cloudinary_id: isUploaded.public_id,
    };

    if (isUser) {
      gifCreateObject.UserId = isUser.id;
      gifCreateObject.isDefault = false;
    }

    const Video = await GifModel.create(gifCreateObject);

    return res.status(201).json({ ...Video.createRepresenter() });
  };
  return { Create };
};
