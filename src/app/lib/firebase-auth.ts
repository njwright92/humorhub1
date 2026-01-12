import type { Auth } from "firebase/auth";
import { app } from "./firebase-app";

let _auth: Auth | null = null;

export const getAuth = async (): Promise<Auth> => {
  if (_auth) return _auth;

  const { getAuth: firebaseGetAuth } = await import("firebase/auth");
  _auth = firebaseGetAuth(app);
  return _auth;
};
