import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let serviceAccount;

// Cloud / Railway: JSON string
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('🔥 Using FIREBASE_SERVICE_ACCOUNT from env');
  } catch (err) {
    console.error('❌ Invalid JSON in FIREBASE_SERVICE_ACCOUNT:', err.message);
    process.exit(1);
  }
}
// Local dev: file path
else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const keyPath = resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!existsSync(keyPath)) {
    console.error('❌ Firebase service account key not found at', keyPath);
    process.exit(1);
  }
  try {
    serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
    console.log('🔥 Using FIREBASE_SERVICE_ACCOUNT_PATH from local file');
  } catch (err) {
    console.error('❌ Error parsing local Firebase service account JSON:', err.message);
    process.exit(1);
  }
} else {
  console.error('❌ No Firebase service account provided.');
  process.exit(1);
}

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

export const auth = admin.auth();
export default admin;
