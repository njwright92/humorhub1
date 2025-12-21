import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Cached instances
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export const getAuth = async (): Promise<Auth> => {
  if (_auth) return _auth;

  const { getAuth: firebaseGetAuth } = await import("firebase/auth");
  _auth = firebaseGetAuth(app);
  return _auth;
};

export const getDb = async (): Promise<Firestore> => {
  if (_db) return _db;

  const { getFirestore } = await import("firebase/firestore");
  _db = getFirestore(app);
  return _db;
};

export const getStorage = async (): Promise<FirebaseStorage> => {
  if (_storage) return _storage;

  const { getStorage: firebaseGetStorage } = await import("firebase/storage");
  _storage = firebaseGetStorage(app);
  return _storage;
};

export { app };
