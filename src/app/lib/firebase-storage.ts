import type { FirebaseStorage } from "firebase/storage";
import { app } from "./firebase-app";

let _storage: FirebaseStorage | null = null;

export const getStorage = async (): Promise<FirebaseStorage> => {
  if (_storage) return _storage;

  const { getStorage: firebaseGetStorage } = await import("firebase/storage");
  _storage = firebaseGetStorage(app);
  return _storage;
};
