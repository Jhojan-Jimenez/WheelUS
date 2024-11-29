import admin from 'firebase-admin';
import { sendNotificationToUser } from '../middlewares/webSockets.js';
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
