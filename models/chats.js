import admin from 'firebase-admin';
import { db } from '../config/database.js';

class chatModel {
  static async getChats(userId) {
    const snapshot = await db
      .collection('chats')
      .where('users', 'array-contains', userId)
      .get();

    const chats = snapshot.docs.map((doc) => {
      return doc.data();
    });
    return chats || [];
  }
  static async getChat(chatId) {
    const snapshot = await db.collection('chats').doc(chatId).get();
    if (!snapshot.exists) {
      throw new Error('Chat not found');
    }
    return snapshot.data();
  }
  static async createChat(userId, contactId) {
    const chatId = generateChatId(userId, String(contactId));
    const chatRef = db.collection('chats').doc(chatId);

    const chatDoc = await chatRef.get();

    if (chatDoc.exists) {
      throw new Error('Chat already exists');
    }

    const chatData = {
      chatId,
      users: [userId, contactId],
      lastMessage: '',
      lastMessageTimestamp: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      unreadCounts: {},
    };

    await chatRef.set(chatData);

    const chat = (await chatRef.get()).data();
    return chat;
  }

  static async getAllMessages(chatId) {

    const snapshot = await db
      .collection('messages')
      .where('chatId', '==', String(chatId))
      .orderBy('timestamp', 'asc')
      .get();
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return messages || [];
  }

  static async postMessage(userId, contactId, message) {
    const chatId = generateChatId(userId, contactId);
    const messageRef = db.collection('messages').doc();

    const messageData = {
      chatId,
      senderId: userId,
      receiverId: contactId,
      content: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false,
    };

    const chatRef = db.collection('chats').doc(chatId);

    await db.runTransaction(async (transaction) => {
      const chatDoc = await transaction.get(chatRef);

      if (!chatDoc.exists) {
        const newChat = {
          chatId,
          users: [userId, contactId],
          lastMessage: message,
          lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          unreadCounts: { [userId]: 0, [contactId]: 1 },
        };
        transaction.set(chatRef, newChat);
      } else {
        transaction.update(chatRef, {
          lastMessage: message,
          lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
          [`unreadCounts.${contactId}`]:
            admin.firestore.FieldValue.increment(1),
        });
      }

      transaction.set(messageRef, messageData);
    });

    const createdMessage = await messageRef.get();
    return { id: createdMessage.id, ...createdMessage.data() };
  }
  static async readChat(userId, chatId) {
    const chatRef = db.collection('chats').doc(chatId);
    await chatRef.update({
      [`unreadCounts.${userId}`]: 0,
    });
  }
  static async getUnreadChats(userId) {
    const snapshot = await db
      .collection('chats')
      .where('users', 'array-contains', userId)
      .get();

    const chats = snapshot.docs.map((doc) => doc.data());

    const totalUnreadCount = chats.reduce((acc, chat) => {
      if (
        chat.unreadCounts &&
        chat.unreadCounts[userId] &&
        chat.unreadCounts[userId] > 0
      ) {
        return acc + chat.unreadCounts[userId];
      }
      return acc;
    }, 0);

    return totalUnreadCount;
  }
}

function generateChatId(userId, contactId) {
  return [userId, contactId].sort().join('');
}

export default chatModel;
