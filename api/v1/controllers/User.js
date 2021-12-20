/* eslint-disable import/extensions */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { SharedMiddleware } from '../../../middlewares/index.js';
import db from '../../../models/index.js';
import sendEmail from '../../../utils/sendEmail.js';
import getPagination from '../../../utils/getPagination.js';

const {
  Sequelize: { Op }, user: User, token: Token, video: Video, audio: Audio, image: Image, gif: Gif,
} = db;

export default () => {
  // Creating a new user
  const signUp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // hash password
    req.body.password = await bcrypt.hash(
      req.body.password,
      bcrypt.genSaltSync(10),
    );
    // convert email to lowercase
    req.body.email = req.body.email.toLowerCase();

    // create user's account
    const user = await User.create(req.body);

    // send email notification on Sign up
    await sendEmail(req.body.email, 'New SignUp', 'Welcome to Kvid. Thank you for choosing awesomeness. We offer great services in making you the king you are. Please log in with your details. This is an automatically generated email. Please do not reply to this email. If you face issues, please contact us at www.keyla.ng', `${user.firstName} ${user.lastName}`, res);

    // create user token
    const token = jwt.sign({ email: user.email }, process.env.SECRET, {
      expiresIn: '20d',
    });
    return res.status(201).json({ ...user.representer(), token });
  };

  const login = async (req, res) => {
    // check for errors from validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Check if client exists
    const client = await User.findOne({
      where: { email: req.body.email },
      include: [
        {
          model: db.audio,
          attributes: ['id', 'audio', 'title', 'updatedAt'],
        },
        {
          model: db.video,
          attributes: ['id', 'video', 'title', 'updatedAt'],
        },
        {
          model: db.image,
          attributes: ['id', 'image', 'updatedAt'],
        },
        {
          model: db.gif,
          attributes: ['id', 'gif', 'updatedAt'],
        },
      ],
    });

    if (!client) return res.status(400).json({ message: 'Invalid login details' });

    // If client exists compare password
    const isValidPassword = await bcrypt.compare(req.body.password, client.password);
    if (!isValidPassword) return res.status(400).json({ message: 'Invalid login details' });

    const defaultVideos = await Video.findAll({ where: { isDefault: true }, attributes: ['id', 'title', 'video'] });
    const defaultAudios = await Audio.findAll({ where: { isDefault: true }, attributes: ['id', 'title', 'audio'] });
    const defaultImages = await Image.findAll({ where: { isDefault: true }, attributes: ['id', 'image'] });
    const defaultGifs = await Gif.findAll({ where: { isDefault: true }, attributes: ['id', 'gif'] });

    // Generate user token
    const token = jwt.sign(
      {
        email: client.email,
      },
      process.env.SECRET,
      {
        expiresIn: '20d',
      },
    );
    return res.status(200).json({
      ...client.representer(), defaultVideos, defaultAudios, defaultImages, defaultGifs, token,
    });
  };

  const getOneUser = async (req, res) => {
    const userId = req.params.id;
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      return res
        .status(200)
        .json({ status: 200, message: "Here's the user", data: user });
    }
    return res
      .status(200)
      .json({
        status: 400,
        message: 'No user found..please try again later',
      });
  };

  const getAllUsers = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { page, size, search } = req.query;

    const condition = search
      ? {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      } : null;

    const { limit, offset } = getPagination(page, size);

    const { count: totalUser, rows } = await User.findAndCountAll({
      where: condition,
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'paid'],
      distinct: true,
      limit,
      offset,
    });

    const Users = rows.map(({
      id, firstName, lastName, email, createdAt, paid,
    }) => ({
      id, name: `${firstName} ${lastName}`, email, date: moment(createdAt).format('l'), paid,
    }));
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalUser / limit);

    return res.status(200).json({
      totalUser, Users, totalPages, currentPage,
    });
  };

  // Update User Status
  const statusUpdate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Query for the unique user
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(400).json({ message: 'Invalid user details' });

    user.paid = req.body.status;

    // Update actual user record
    await user.save();

    return res.status(200).json({ ...user.representer() });
  };

  const update = async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    // check for errors in the request
    SharedMiddleware.validateResult(req, res);

    // Query for the unique user
    const userId = req.params.id;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(400).json({ status: 400, message: 'This user does not exist...please try again later' });

    await User.update(
      {
        firstName,
        lastName,
        email,
        password,
      },
      { where: { id: userId } },
    );

    return res.status(200).json('User update successful');
  };

  // Destroy An Exisitng User
  const deleteUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Query for the unique user
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(400).json({ message: 'Invalid user details' });

    await user.destroy();
    return res.status(204).json();
  };

  const forgetPassword = async (req, res) => {
    SharedMiddleware.validateResult(req, res);

    // Find unique user
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid user details' });

    let token = await Token.findOne({ UserId: user.id });
    if (!token) {
      token = await Token.create({
        UserId: user.id,
        token: crypto.randomBytes(32).toString('hex'),
      });
    }

    await sendEmail(user.email, 'Password Reset', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>forget password</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
      </head>
      <body>
          <div class="container text-secondary p-3 text-center">
              <h3 class="text-primary"><i>forget passoword</i></h3>
              <div class="mt-3"><button class="btn btn-primary btn-md">
              <a class="text-light" href='${process.env.frontend_url}reset-password/${user.id}/${token.token}'>input new password page</a>
              </button></div>
              <p class="mt-3">You can safely ignore this email if you believe this is an error.</p>
          </div>
      
      </body>
      </html> `, `${user.firstName} ${user.lastName}`, res);

    return res.status(200).json({ message: 'password reset link sent to your email account' });
  };

  const passwordReset = async (req, res) => {
    SharedMiddleware.validateResult(req, res);

    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(400).json({ message: 'Invalid user details' });

    const token = await Token.findOne({
      where: {
        UserId: user.id,
        token: req.params.token,
      },
    });
    if (!token) return res.status(400).json({ message: 'invalid token or expired' });

    // hash password
    req.body.password = await bcrypt.hash(
      req.body.password,
      bcrypt.genSaltSync(10),
    );
    user.password = req.body.password;
    await user.save();
    await token.destroy();

    return res.status(200).json({ message: 'password reset sucessfully.' });
  };

  return {
    signUp,
    login,
    getOneUser,
    getAllUsers,
    update,
    deleteUser,
    forgetPassword,
    passwordReset,
    statusUpdate,
  };
};
