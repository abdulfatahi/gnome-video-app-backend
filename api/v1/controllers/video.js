/* eslint-disable import/extensions */
import fs from 'fs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import db from '../../../models/index.js';
import cloudinary from '../../../lib/cloudConfig.js';

const { video: VideoModel, user: User } = db;

export default () => {
  // Creating a new video record
  const Create = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.status(422).json({ errors: error.array() });
    if (!req.file) return res.status(400).json({ message: 'video required' });
    if (!req.body.title) return res.status(400).json({ message: 'title required' });

    const { path, filename } = req.file; // file becomes available in req at this point
    // Upload Video to Cloudinary
    const isUploaded = await cloudinary.uploader.upload(
      path,
      {
        resource_type: 'video',
        public_id: `VideoUploads/${filename}`,
        chunk_size: 6000000,
        eager: [
          {
            width: 300,
            height: 300,
            crop: 'pad',
            audio_codec: 'none',
          },
          {
            width: 160,
            height: 100,
            crop: 'crop',
            gravity: 'south',
            audio_codec: 'none',
          },
        ],
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

    const videoCreateObject = {
      title: req.body.title,
      video: isUploaded.secure_url,
      cloudinary_id: isUploaded.public_id,
    };

    if (isUser) {
      videoCreateObject.UserId = isUser.id;
      videoCreateObject.isDefault = false;
    }

    const Video = await VideoModel.create(videoCreateObject);

    return res.status(201).json({ ...Video.createRepresenter() });
  };

  // Get list of all Videos
  const All = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const Videos = await VideoModel.findAll({ attributes: ['id', 'video', 'title', 'isDefault'] });
    return res.status(200).json({ Videos });
  };

  // Update An Exisitng Video
  const Update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    let Video = await VideoModel.findByPk(req.params.id, { attributes: ['id', 'video', 'cloudinary_id', 'title'] });

    if (!req.file && !req.body.title) {
      return res.status(200).json(
        { ...Video.createRepresenter() },
      );
    }

    if (req.file) {
      const isDeleted = await cloudinary.api.delete_resources([Video.cloudinary_id], { resource_type: 'video' });
      if (!isDeleted) return res.status(500).json({ isDeleted });
      const { path, filename } = req.file; // file becomes available in req at this point
      // Upload Video to Cloudinary
      const isUploaded = await cloudinary.uploader.upload(
        path,
        {
          resource_type: 'video',
          public_id: `VideoUploads/${filename}`,
          chunk_size: 6000000,
          eager: [
            {
              width: 300,
              height: 300,
              crop: 'pad',
              audio_codec: 'none',
            },
            {
              width: 160,
              height: 100,
              crop: 'crop',
              gravity: 'south',
              audio_codec: 'none',
            },
          ],
        },
      );
      if (!isUploaded) return res.status(500).json({ isUploaded });

      await fs.unlinkSync(path);

      Video.video = isUploaded.secure_url;
      Video.cloudinary_id = isUploaded.public_id;
    }

    if (req.body.title) Video.title = req.body.title;

    Video = await Video.save();

    return res.status(200).json({ ...Video.createRepresenter() });
  };

  // Destroy An Exisitng Video
  const Destroy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Query for the unique video
    const Video = await VideoModel.findByPk(req.params.id);

    const isDeleted = await cloudinary.api.delete_resources([Video.cloudinary_id], { resource_type: 'video' });
    if (!isDeleted) return res.status(500).json({ isDeleted });
    await Video.destroy();
    return res.status(204).json();
  };

  return {
    Create, All, Update, Destroy,
  };
};
