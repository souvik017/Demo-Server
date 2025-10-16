import admin from 'firebase-admin';

let serviceAccount;

// Debug: Log what environment variables are available
console.log('🔍 Checking Firebase configuration...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

// Build service account from individual environment variables
if (process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_PRIVATE_KEY && 
    process.env.FIREBASE_CLIENT_EMAIL) {
  
  try {
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      // Important: Replace escaped newlines with actual newlines
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: 'googleapis.com'
    };
    
    console.log('✅ Built service account from environment variables');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Client Email:', serviceAccount.client_email);
    console.log('   Private Key starts with:', serviceAccount.private_key.substring(0, 27));
  } catch (err) {
    console.error('❌ Error building service account from env variables:', err.message);
    process.exit(1);
  }
} else {
  console.error('❌ Missing required Firebase environment variables!');
  console.error('   Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
  console.error('   FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
  console.error('   FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
  console.error('   FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('🔥 Firebase Admin initialized successfully');
    console.log('   App name:', admin.app().name);
  } catch (err) {
    console.error('❌ Firebase Admin initialization failed');
    console.error('   Error:', err.message);
    
    // Helpful debugging hints
    if (err.message.includes('private_key')) {
      console.error('\n💡 Private Key Troubleshooting:');
      console.error('   1. Ensure private key is wrapped in quotes in .env file');
      console.error('   2. Check that \\n is used (not actual newlines)');
      console.error('   3. Key should start with: -----BEGIN PRIVATE KEY-----');
      console.error('   4. Key should end with: -----END PRIVATE KEY-----');
      console.error('\n   Current key preview:');
      console.error('   First 50 chars:', serviceAccount.private_key.substring(0, 50));
      console.error('   Last 50 chars:', serviceAccount.private_key.substring(serviceAccount.private_key.length - 50));
    }
    
    process.exit(1);
  }
} else {
  console.log('ℹ️  Firebase Admin already initialized');
}

// Export auth and admin for use in other files
export const auth = admin.auth();
export default admin;