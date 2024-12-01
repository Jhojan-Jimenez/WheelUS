import admin from 'firebase-admin';
import { sendNotificationToUser } from '../middlewares/webSockets.js';
import { db } from '../config/database.js';
import { getDoc, updateDoc } from 'firebase/firestore';
export async function addNotification(userRef, type, content, timestamp) {
  await userRef.update({
    notifications: admin.firestore.FieldValue.arrayUnion({
      type,
      content,
      timestamp,
    }),
  });
  await sendNotificationToUser(userRef.id, content);
}
export async function deleteNotificationByIndex(userId, index) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  const notifications = userDoc.data().notifications || [];

  if (index < 0 || index >= notifications.length) {
    throw new Error('Invalid index');
  }

  notifications.splice(index, 1);

  await userRef.update({ notifications });
}
