import winston from 'winston';

// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  winston.error(err.message, err);
  return res.status(500).json({ message: 'Internal Server Error' });
};
