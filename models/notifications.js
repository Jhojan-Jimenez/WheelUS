import admin from 'firebase-admin';
export async function addNotification(userRef, type, content, timestamp) {
  await userRef.update({
    notifications: admin.firestore.FieldValue.arrayUnion({
      type,
      content,
      timestamp,
    }),
  });
}
