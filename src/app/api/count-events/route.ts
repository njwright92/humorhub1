import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// In-memory cache
let cache: { count: number; lastUpdated: number } | null = null;
const CACHE_DURATION = 60 * 10000; // 1 minute cache duration

// Construct the service account object directly using environment variables
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
};

console.log("Service Account:", serviceAccount);

// Initialize Firebase Admin SDK if it's not already initialized
if (!admin.apps.length) {
  console.log("Initializing Firebase Admin SDK...");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
} else {
  console.log("Firebase Admin SDK already initialized.");
}

export async function GET() {
  console.log("GET request received.");

  // Check if the cache is valid
  if (cache && Date.now() - cache.lastUpdated < CACHE_DURATION) {
    console.log("Returning data from cache.");
    return NextResponse.json({
      message: "Events counted and updated.",
      count: cache.count,
    });
  }

  try {
    // Fetch data from Firestore
    const db = admin.firestore();
    const eventsRef = db.collection("userEvents");
    console.log("Fetching events from Firestore...");
    const snapshot = await eventsRef.get();

    if (snapshot.empty) {
      console.log("No events found.");
      return NextResponse.json({ message: "No events found." });
    }

    const eventCount = snapshot.size;
    console.log(`Number of events found: ${eventCount}`);

    // Cache the result
    cache = { count: eventCount, lastUpdated: Date.now() };

    // Update the event counter in Firestore
    const counterRef = db.collection("counters").doc("eventsCounter");
    console.log("Updating event counter in Firestore...");
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
