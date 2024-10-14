import 'dotenv/config';
import admin from 'firebase-admin';
import serviceAccount from '../firebaseKey.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATA_BASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const db = admin.firestore();
export const rtdb = admin.database();
export const storage = admin.storage().bucket();
