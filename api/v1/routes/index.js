/* eslint-disable import/extensions */
import { Router } from 'express';
import userRoute from './userRoute.js';
import adminRoute from './adminRoute.js';
import videoRoute from './videoRoute.js';
import audioRoute from './audioRoute.js';
import imageRoute from './imageRoute.js';
import gifRoute from './gifRoute.js';

const router = Router();

router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/video', videoRoute);
router.use('/audio', audioRoute);
router.use('/image', imageRoute);
router.use('/gif', gifRoute);

export default router;
