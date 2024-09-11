import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// In-memory cache
let cache: { lastUpdated: number; count: number } | null = null;
const CACHE_DURATION = 30 * 1000; // 10-minute cache duration

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

  // Check if cache is bypassed or cache is invalid
  if (!refresh && cache && Date.now() - cache.lastUpdated < CACHE_DURATION) {
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

    // Query for events added in the last week
    const snapshot = await eventsRef
      .where("googleTimestamp", ">=", oneWeekAgoISO)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        message: "No events found in the last week.",
        count: 0,
      });
    }

    // Count the number of events
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
    console.error("Error counting events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
