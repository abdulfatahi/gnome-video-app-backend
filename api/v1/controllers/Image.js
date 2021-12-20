/* eslint-disable import/extensions */
import fs from 'fs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import db from '../../../models/index.js';
import cloudinary from '../../../lib/cloudConfig.js';

const { image: ImageModel, user: User } = db;

export default () => {
  // Creating a new image record
  const Create = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.status(422).json({ errors: error.array() });
    if (!req.file) return res.status(400).json({ message: 'image required' });

    const { path, filename } = req.file; // file becomes available in req at this point
    // Upload Image to Cloudinary
    const isUploaded = await cloudinary.uploader.upload(
      path,
      {
        public_id: `ImageUploads/${filename}`,
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

    const imageCreateObject = {
      image: isUploaded.secure_url,
      cloudinary_id: isUploaded.public_id,
    };

    if (isUser) {
      imageCreateObject.UserId = isUser.id;
      imageCreateObject.isDefault = false;
    }

    const Image = await ImageModel.create(imageCreateObject);

    return res.status(201).json({ ...Image.createRepresenter() });
  };

  // Get list of all Images
  const All = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const Images = await ImageModel.findAll({ attributes: ['id', 'image', 'isDefault'] });
    return res.status(200).json({ Images });
  };

  // Update An Exisitng audio
  const Update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    let Image = await ImageModel.findByPk(req.params.id, { attributes: ['id', 'image', 'cloudinary_id'] });

    if (!req.file && !req.body.title) {
      return res.status(200).json(
        { ...Image.createRepresenter() },
      );
    }

    if (req.file) {
      const isDeleted = await cloudinary.uploader.destroy(Image.cloudinary_id);
      if (!isDeleted) return res.status(500).json({ isDeleted });
      const { path, filename } = req.file; // file becomes available in req at this point
      // Upload New Image to Cloudinary
      const isUploaded = await cloudinary.uploader.upload(
        path,
        {
          public_id: `ImageUploads/${filename}`,
        },
      );
      if (!isUploaded) return res.status(500).json({ isUploaded });

      await fs.unlinkSync(path);

      Image.image = isUploaded.secure_url;
      Image.cloudinary_id = isUploaded.public_id;
    }

    Image = await Image.save();

    return res.status(200).json({ ...Image.createRepresenter() });
  };

  // Destroy An Exisitng Image
  const Destroy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Query for the unique Image
    const Image = await ImageModel.findByPk(req.params.id);

    const isDeleted = await cloudinary.uploader.destroy(Image.cloudinary_id);
    if (!isDeleted) return res.status(500).json({ isDeleted });
    await Image.destroy();
    return res.status(204).json();
  };

  return {
    Create, All, Update, Destroy,
  };
};
