import { Router } from 'express';
import userController from '../controllers/user.js';
const userRouter = Router();

userRouter.get('/:id', userController.getUser);
userRouter.patch('/:id', userController.patchUser);
userRouter.patch('/:id/rides', userController.patchUserRides);

export default userRouter;
