import { Router } from 'express';
import { upload, uploadImage } from '../controllers/uploadController.js';
import { authenticate, attachUser } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, attachUser, upload.single('photo'), uploadImage);

export default router;
