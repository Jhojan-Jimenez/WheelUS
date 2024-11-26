import { Router } from 'express';
import authController from '../controllers/auth.js';
import { upload } from '../middlewares/uploadImages.js';
const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', upload, authController.register);
authRouter.post('/refresh-token', authController.refreshToken);

export default authRouter;
