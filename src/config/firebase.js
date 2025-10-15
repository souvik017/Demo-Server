// src/config/firebase.js
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Cloud / Railway: JSON string from env
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('🔥 Using FIREBASE_SERVICE_ACCOUNT from env');
  } catch (err) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    process.exit(1);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Local development: path to JSON file
  const keyPath = resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!existsSync(keyPath)) {
    console.error('❌ Firebase service account key not found at', keyPath);
    process.exit(1);
  }

  try {
    serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
    console.log('🔥 Using FIREBASE_SERVICE_ACCOUNT_PATH from local file');
  } catch (err) {
    console.error('❌ Error parsing Firebase service account JSON:', err.message);
    process.exit(1);
  }
} else {
  console.error('❌ No Firebase service account provided. Set either FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH');
  process.exit(1);
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('🔥 Firebase Admin initialized');
  } catch (err) {
    console.error('❌ Firebase Admin initialization failed:', err.message);
    process.exit(1);
  }
}

// Export auth instance
export const auth = admin.auth();
export default admin;
