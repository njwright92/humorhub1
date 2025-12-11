import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth, type Auth } from "firebase-admin/auth";
import {
  getFirestore as getAdminFirestore,
  type Firestore,
} from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Validate environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin SDK environment variables. " +
        "Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY"
    );
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Handle the escaped newlines in the private key
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return adminApp;
}

export function getServerAuth(): Auth {
  if (adminAuth) return adminAuth;
  adminAuth = getAdminAuth(getAdminApp());
  return adminAuth;
}

export function getServerDb(): Firestore {
  if (adminDb) return adminDb;
  adminDb = getAdminFirestore(getAdminApp());
  return adminDb;
}

// Helper to verify ID tokens from client
export async function verifyIdToken(token: string) {
  try {
    const auth = getServerAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return { valid: true, uid: decodedToken.uid, decodedToken };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { valid: false, uid: null, decodedToken: null };
  }
}
