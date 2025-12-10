import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 1. Initialize App (This is lightweight, safe to do immediately)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 2. Create singleton holders
let _auth = null;
let _db = null;
let _storage = null;

// 3. Export Async Getters
// These only download the code when you actually call them!

export const getAuth = async () => {
  if (_auth) return _auth;
  const { getAuth: firebaseGetAuth } = await import("firebase/auth");
  _auth = firebaseGetAuth(app);
  return _auth;
};

export const getDb = async () => {
  if (_db) return _db;
  const { getFirestore } = await import("firebase/firestore");
  _db = getFirestore(app);
  return _db;
};

export const getStorage = async () => {
  if (_storage) return _storage;
  const { getStorage: firebaseGetStorage } = await import("firebase/storage");
  _storage = firebaseGetStorage(app);
  return _storage;
};

export { app };
