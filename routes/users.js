import { Router } from 'express';
import userController from '../controllers/user.js';
import { upload } from '../middlewares/uploadImages.js';
import { verifyUserID } from '../middlewares/existsDocuments.js';
const userRouter = Router();

userRouter.get('/:id', verifyUserID, userController.getUser);
userRouter.patch('/:id', verifyUserID, upload, userController.patchUser);
userRouter.patch('/:id/rides', verifyUserID, userController.patchUserRides);

export default userRouter;
