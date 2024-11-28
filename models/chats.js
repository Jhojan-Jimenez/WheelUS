import admin from 'firebase-admin';
import { db } from '../config/database.js';

class chatModel {
  static async getAllMessages(userId, contactId) {
    const chatId = userId + contactId;
    const snapshot = await db.collection('messages').get();
    const messages = snapshot.docs.map((doc) => {
      return doc.data().chatId === chatId ? doc.data() : null;
    });
    return messages || [];
  }
  static async postMessage(userId, contactId, message) {
    const chatId = userId + contactId;
    const messageData = {
      chatId,
      senderId: userId,
      receiverId: contactId,
      content: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('messages').add(messageData);
  }
}

export default chatModel;
