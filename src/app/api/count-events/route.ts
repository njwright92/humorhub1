import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// In-memory cache to store event count and last updated date
let cache: { lastUpdatedDate: string; count: number } | null = null;

// Parse the private key for Firebase admin initialization
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  ),
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh");

  const today = new Date().toISOString().slice(0, 10); // 'yyyy-mm-dd'

  // Check if cache exists and is still valid (today's date)
  if (!refresh && cache && cache.lastUpdatedDate === today) {
    return NextResponse.json({
      message: "Events counted and updated (from cache).",
      count: cache.count,
    });
  }

  try {
    // Get Firestore reference
    const db = admin.firestore();
    const counterRef = db.collection("counters").doc("eventsCounter");

    // Fetch the current count and last updated date from Firestore
    const counterDoc = await counterRef.get();
    const counterData = counterDoc.exists ? counterDoc.data() : null;

    // If the data exists and was updated today, return it
    if (counterData && counterData.lastUpdatedDate === today && !refresh) {
      cache = {
        count: counterData.count,
        lastUpdatedDate: counterData.lastUpdatedDate,
      };
      return NextResponse.json({
        message: "Events counted and updated (from Firestore).",
        count: counterData.count,
      });
    }

    // Get the timestamp for 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    // Query Firestore for events added in the last week
    const eventsRef = db.collection("userEvents");
    const snapshot = await eventsRef
      .where("googleTimestamp", ">=", oneWeekAgoISO)
      .get();

    // Count the number of events
    const eventCount = snapshot.size;

    // Cache the result in memory
    cache = { count: eventCount, lastUpdatedDate: today };

    // Update the Firestore counter document with the new count and lastUpdatedDate
    await counterRef.set(
      {
        count: eventCount,
        lastUpdatedDate: today,
      },
      { merge: true }
    );

    return NextResponse.json({
      message: "Events counted and updated.",
      count: eventCount,
    });
  } catch (error) {
    console.error("Error counting events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
