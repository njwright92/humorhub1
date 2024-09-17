import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// In-memory cache to store event count and last updated timestamp
let cache: { lastUpdated: number; count: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24-hour cache duration

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

  // Check if cache exists and is still valid (24 hours)
  if (!refresh && cache && Date.now() - cache.lastUpdated < CACHE_DURATION) {
    return NextResponse.json({
      message: "Events counted and updated (from cache).",
      count: cache.count,
    });
  }

  try {
    // Get Firestore reference
    const db = admin.firestore();
    const counterRef = db.collection("counters").doc("eventsCounter");

    // Fetch the current count and last updated timestamp from Firestore
    const counterDoc = await counterRef.get();
    const counterData = counterDoc.exists ? counterDoc.data() : null;

    // If the data exists and was updated within the last 24 hours, return it
    if (
      counterData &&
      counterData.lastUpdated &&
      Date.now() - counterData.lastUpdated.toMillis() < CACHE_DURATION &&
      !refresh
    ) {
      cache = {
        count: counterData.count,
        lastUpdated: counterData.lastUpdated.toMillis(),
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
    cache = { count: eventCount, lastUpdated: Date.now() };

    // Update the Firestore counter document with the new count and lastUpdated timestamp
    await counterRef.set(
      {
        count: eventCount,
        lastUpdated: admin.firestore.Timestamp.now(),
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
