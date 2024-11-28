import { Router } from 'express';
import chatController from '../controllers/chats.js';

const chatRouter = Router();

chatRouter.get('/messages/:contactId', chatController.getMessages);
chatRouter.post('/messages/:contactId', chatController.postMessages);

export default chatRouter;
