import chatModel from '../models/chats.js';
import usersModel from '../models/users.js';

class chatController {
  static async getChats(req, res, next) {
    try {
      const userId = req.userId;
      const chats = await chatModel.getChats(userId);
      res.status(200).json({ chats });
    } catch (error) {
      next(error);
    }
  }
  static async getChat(req, res, next) {
    try {
      const { chatId } = req.params;
      const chat = await chatModel.getChat(chatId);
      res.status(200).json({ chat });
    } catch (error) {
      if (error.message === 'Chat not found') {
        return res.status(404).json({ message: 'Chat not found' });
      }
      next(error);
    }
  }
  static async createChat(req, res, next) {
    try {
      const userId = req.userId;
      const { contactId } = req.body;
      if (userId === contactId) {
        return res
          .status(400)
          .json({ message: 'You cannot chat with yourself' });
      }
      await usersModel.getUserById(contactId);
      const newChat = await chatModel.createChat(userId, contactId);
      res.status(200).json({ chat: newChat });
    } catch (error) {
      if (error.message === 'Chat already exists') {
        return res.status(409).json({ message: 'Chat already exists' });
      }
      next(error);
    }
  }
  static async getMessages(req, res, next) {
    try {
      const userId = req.userId;
      const { chatId } = req.params;
      const messages = await chatModel.getAllMessages(chatId);
      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }
  static async postMessages(req, res, next) {
    try {
      const userId = req.userId;
      const { contactId } = req.params;
      const { message } = req.body;
      const newMessage = await chatModel.postMessage(
        userId,
        contactId,
        message
      );
      res.status(200).json({ message: newMessage });
    } catch (error) {
      next(error);
    }
  }
  static async readChat(req, res, next) {
    try {
      const userId = req.userId;
      const { chatId } = req.body;
      await chatModel.readChat(userId, chatId);
      res.status(200).json({ message: 'Chat marked as read' });
    } catch (error) {
      next(error);
    }
  }
  static async getUnreadChats(req, res, next) {
    try {
      const userId = req.userId;
      const chats = await chatModel.getUnreadChats(userId);
      res.status(200).json({ chats });
    } catch (error) {
      next(error);
    }
  }
}
export default chatController;
