/* eslint-disable import/extensions */
import cors from 'cors';
import express from 'express';
import vm from 'v-response';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ApiVersions from '../api/index.js';
import { ErrorMiddleware } from '../middlewares/index.js';

const app = express();

export default () => {
  app.use(cors());

  app.use(helmet());

  app.set('trust proxy', 1);

  //  apply to all requests
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP. Try again in 15mins.',
  }));

  // logger middleware
  app.use((req, _, next) => {
    vm.log(`🔥🍕[${new Date().toTimeString()}]: `, `${req.method} ${req.url}🔥🍕`);
    next();
  });

  // Add middlewares for parsing JSON and urlencoded data and populating `req.body`
  app.use(express.urlencoded({ extended: false }));

  // parse requests of content-type - application/json
  app.use(express.json());

  // simple route
  app.get('/', (_, res) => {
    res.json({ message: 'Welcome to KVid Video Creation Platform.' });
  });

  app.use('/api', ApiVersions);

  app.use(ErrorMiddleware);

  app.use((_, res) => {
    res.status(404).json({ message: 'Page not found.' });
  });

  // set port, listen for requests
  app.listen(process.env.PORT).on('listening', () => {
    vm.log(`💘 app is listening on ${process.env.PORT} 🚀`);
  });
};
