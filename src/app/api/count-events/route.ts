import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// In-memory cache
let cache: { count: number; lastUpdated: number } | null = null;
const CACHE_DURATION = 60 * 10000; // 10-minute cache duration

// Construct the service account object directly using environment variables
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export async function GET() {
  // Check if the cache is valid
  if (cache && Date.now() - cache.lastUpdated < CACHE_DURATION) {
    return NextResponse.json({
      message: "Events counted and updated (from cache).",
      count: cache.count,
    });
  }

  try {
    // Fetch data from Firestore
    const db = admin.firestore();
    const eventsRef = db.collection("userEvents");

    // Get the timestamp for 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Query for events added in the last week (using 'googleTimestamp' field)
    const snapshot = await eventsRef
      .where(
        "googleTimestamp",
        ">=",
        admin.firestore.Timestamp.fromDate(oneWeekAgo)
      )
      .get();

    // Check if no events were found
    if (snapshot.empty) {
      return NextResponse.json({
        message: "No events found in the last week.",
        count: 0, // Set count to 0
      });
    }

    const eventCount = snapshot.size;

    // Cache the result
    cache = { count: eventCount, lastUpdated: Date.now() };

    // Update the event counter in Firestore
    const counterRef = db.collection("counters").doc("eventsCounter");

    await counterRef.set({ count: eventCount }, { merge: true });

    return NextResponse.json({
      message: "Events counted and updated.",
      count: eventCount,
    });
  } catch (error) {
    console.error("Error in count-events API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
