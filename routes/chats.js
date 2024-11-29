import { Router } from 'express';
import chatController from '../controllers/chats.js';

const chatRouter = Router();

chatRouter.get('/user', chatController.getChats);
chatRouter.get('/user-notifications', chatController.getUnreadChats);
chatRouter.get('/get/:chatId', chatController.getChat);
chatRouter.post('/create', chatController.createChat);
chatRouter.patch('/read', chatController.readChat);
chatRouter.get('/messages/:chatId', chatController.getMessages);
chatRouter.post('/messages/:contactId', chatController.postMessages);

export default chatRouter;
