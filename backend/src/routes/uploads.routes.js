import { Router } from 'express';
import { upload, uploadImage } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, upload.single('photo'), uploadImage);

export default router;
