import { Router } from 'express';
import userController from '../controllers/user.js';
import { upload } from '../middlewares/uploadImages.js';
import { verifyUserID } from '../middlewares/existsDocuments.js';
const userRouter = Router();

userRouter.get('/', userController.getUserByToken);
userRouter.get('/notifications', userController.getUserNotifications);
userRouter.get('/:id', verifyUserID, userController.getUserByID);
userRouter.patch('/:id', verifyUserID, upload, userController.patchUser);
userRouter.get('/:id/rides', verifyUserID, userController.getUserRides);
userRouter.post('/:id/rides', verifyUserID, userController.addUserRides);
userRouter.delete('/notifications', userController.deleteAllUserNotifications);
userRouter.delete('/:id/rides', verifyUserID, userController.deleteUserRide);
userRouter.delete(
  '/:notificationIndex/notifications',
  userController.deleteUserNotification
);

export default userRouter;
