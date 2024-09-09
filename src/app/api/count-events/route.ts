import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// In-memory cache
let cache: { lastUpdated: number; count: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10-minute cache duration

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

export async function GET() {
  // Check if the cache is still valid
  if (cache && Date.now() - cache.lastUpdated < CACHE_DURATION) {
    return NextResponse.json({
      message: "Events counted and updated (from cache).",
      count: cache.count,
    });
  }

  try {
    // Get Firestore reference
    const db = admin.firestore();
    const eventsRef = db.collection("userEvents");

    // Get the timestamp for 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    console.log("Firestore One Week Ago Timestamp: ", oneWeekAgoISO);

    // Query for events added in the last week using string date comparison
    const snapshot = await eventsRef
      .where("googleTimestamp", ">=", oneWeekAgoISO) // Use ISO string comparison
      .get();

    // If no events are found, return a response
    if (snapshot.empty) {
      return NextResponse.json({
        message: "No events found in the last week.",
        count: 0,
      });
    }

    // Count the number of events
    const eventCount = snapshot.size;

    // Cache the result for future requests
    cache = { count: eventCount, lastUpdated: Date.now() };

    // Update the event counter in Firestore (optional but useful)
    const counterRef = db.collection("counters").doc("eventsCounter");
    await counterRef.set({ count: eventCount }, { merge: true });

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
