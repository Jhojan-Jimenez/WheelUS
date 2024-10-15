import { Router } from 'express';
import userController from '../controllers/user.js';
import { upload } from '../middlewares/uploadImages.js';
const userRouter = Router();

userRouter.get('/:id', userController.getUser);
userRouter.patch('/:id', upload, userController.patchUser);
userRouter.patch('/:id/rides', userController.patchUserRides);

export default userRouter;
