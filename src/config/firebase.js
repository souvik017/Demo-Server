// src/config/firebase.js
import admin from 'firebase-admin';

// Check for service account in env
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not set.');
  process.exit(1);
}

let serviceAccount;
try {
  // Parse the JSON string from env
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (err) {
  console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
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
