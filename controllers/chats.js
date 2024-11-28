import chatModel from '../models/chats.js';

class chatController {
  static async getMessages(req, res, next) {
    try {
      const userId = req.userId;
      const { contactId } = req.params;
      const messages = await chatModel.getAllMessages(userId, contactId);
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
      await chatModel.postMessage(userId, contactId, message);
      res.status(200).json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}
export default chatController;
