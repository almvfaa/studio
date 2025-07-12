import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Server-safe singleton pattern for Firebase initialization
let app: FirebaseApp;
let db: Firestore;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._firebaseApp) {
        global._firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    }
    app = global._firebaseApp;
} else {
    // In production mode, it's safe to simply initialize the app.
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

db = getFirestore(app);

export { app, db };

// Extend the global object to include our custom property
declare global {
  var _firebaseApp: FirebaseApp;
}
