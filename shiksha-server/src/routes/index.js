import express from 'express';

import v1Routes from './v1/index.js';
import ImageRoute from './imageRoute.js';

const router = express.Router();

router.use('/v1', v1Routes);
router.use('/v1/uploads', ImageRoute);

export default router;