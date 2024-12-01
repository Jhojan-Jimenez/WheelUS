import 'dotenv/config';
import admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.KEY_FIREBASE_PROJECT_ID,
  private_key_id: process.env.KEY_FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.KEY_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.KEY_FIREBASE_CLIENT_EMAIL,
  client_id: process.env.KEY_FIREBASE_CLIENT_ID,
  auth_uri: process.env.KEY_FIREBASE_AUTH_URI,
  token_uri: process.env.KEY_FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.KEY_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.KEY_FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};
const service_account2 = {
  type: 'service_account',
  project_id: process.env.KEY_FIREBASE_PROJECT_ID2,
  private_key_id: process.env.KEY_FIREBASE_PRIVATE_KEY_ID2,
  private_key: process.env.KEY_FIREBASE_PRIVATE_KEY2.replace(/\\n/g, '\n'),
  client_email: process.env.KEY_FIREBASE_CLIENT_EMAIL2,
  client_id: process.env.KEY_FIREBASE_CLIENT_ID2,
  auth_uri: process.env.KEY_FIREBASE_AUTH_URI2,
  token_uri: process.env.KEY_FIREBASE_TOKEN_URI2,
  auth_provider_x509_cert_url:
    process.env.KEY_FIREBASE_AUTH_PROVIDER_X509_CERT_URL2,
  client_x509_cert_url: process.env.KEY_FIREBASE_CLIENT_X509_CERT_URL2,
  universe_domain: process.env.UNIVERSE_DOMAIN2,
};

const storageApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATA_BASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
export const databaseApp = admin.initializeApp(
  {
    credential: admin.credential.cert(service_account2),
    databaseURL: process.env.FIREBASE_DATA_BASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  'secondary'
);

export const db = databaseApp.firestore();
export const rtdb = databaseApp.database();
export const storage = storageApp.storage().bucket();
