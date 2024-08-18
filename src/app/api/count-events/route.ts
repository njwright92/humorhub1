import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Get the service account key from the Vercel environment variable
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

// Initialize Firebase Admin SDK if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://your-database-name.firebaseio.com",
  });
}

export async function GET(request: NextRequest) {
  try {
    // Example: Fetch data from Firestore
    const db = admin.firestore();
    const snapshot = await db.collection("eventCount").get();
    const data = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.error();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Example: Add data to Firestore
    const db = admin.firestore();
    await db.collection("your-collection-name").add(body);

    return NextResponse.json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    return NextResponse.error();
  }
}
