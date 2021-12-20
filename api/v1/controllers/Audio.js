/* eslint-disable import/extensions */
import fs from 'fs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import db from '../../../models/index.js';
import cloudinary from '../../../lib/cloudConfig.js';

const { audio: AudioModel, user: User } = db;

export default () => {
  // Creating a new audio record
  const Create = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return res.status(422).json({ errors: error.array() });
    if (!req.file) return res.status(400).json({ message: 'audio required' });
    if (!req.body.title) return res.status(400).json({ message: 'title required' });

    const { path, filename } = req.file; // file becomes available in req at this point
    // Upload Image to Cloudinary
    const isUploaded = await cloudinary.uploader.upload(path, { resource_type: 'raw', public_id: `AudioUploads/${filename}` });
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

    const audioCreateObject = {
      title: req.body.title,
      audio: isUploaded.secure_url,
      cloudinary_id: isUploaded.public_id,
    };

    if (isUser) {
      audioCreateObject.UserId = isUser.id;
      audioCreateObject.isDefault = false;
    }

    const Audio = await AudioModel.create(audioCreateObject);

    return res.status(201).json({ ...Audio.createRepresenter() });
  };

  // Get list of all Audios
  const All = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const Audios = await AudioModel.findAll({ attributes: ['id', 'audio', 'title', 'isDefault'] });
    return res.status(200).json({ Audios });
  };

  // Update An Exisitng audio
  const Update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    let Audio = await AudioModel.findByPk(req.params.id, { attributes: ['id', 'audio', 'cloudinary_id', 'title'] });

    if (!req.file && !req.body.title) {
      return res.status(200).json(
        { ...Audio.createRepresenter() },
      );
    }

    if (req.file) {
      const isDeleted = await cloudinary.api.delete_resources([Audio.cloudinary_id], { resource_type: 'raw' });
      if (!isDeleted) return res.status(500).json({ isDeleted });
      const { path, filename } = req.file; // file becomes available in req at this point
      // Upload Audio to Cloudinary
      const isUploaded = await cloudinary.uploader.upload(path, { resource_type: 'raw', public_id: `AudioUploads/${filename}` });

      if (!isUploaded) return res.status(500).json({ isUploaded });

      await fs.unlinkSync(path);

      Audio.audio = isUploaded.secure_url;
      Audio.cloudinary_id = isUploaded.public_id;
    }

    if (req.body.title) Audio.title = req.body.title;

    Audio = await Audio.save();

    return res.status(200).json({ ...Audio.createRepresenter() });
  };

  // Destroy An Exisitng Audio
  const Destroy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Query for the unique Audio
    const Audio = await AudioModel.findByPk(req.params.id);

    const isDeleted = await cloudinary.api.delete_resources([Audio.cloudinary_id], { resource_type: 'raw' });
    if (!isDeleted) return res.status(500).json({ isDeleted });
    await Audio.destroy();
    return res.status(204).json();
  };

  return {
    Create, All, Update, Destroy,
  };
};
