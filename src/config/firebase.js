// src/config/firebase.js
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Resolve path to JSON file
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './src/config/serviceAccountKey.json';
const absPath = resolve(keyPath);

// Check if file exists
if (!existsSync(absPath)) {
  console.error('❌ Firebase service account key not found at', absPath);
  process.exit(1);
}

// Read JSON file safely
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(absPath, 'utf-8'));
} catch (err) {
  console.error('❌ Error parsing Firebase service account JSON:', err.message);
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
