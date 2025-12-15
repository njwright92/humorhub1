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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

let _auth = null;
let _db = null;
let _storage = null;

export const getAuth = async () => {
  if (_auth) return _auth;

  const {
    initializeAuth,
    browserLocalPersistence,
    browserPopupRedirectResolver,
    indexedDBLocalPersistence,
  } = await import("firebase/auth");

  _auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });

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
