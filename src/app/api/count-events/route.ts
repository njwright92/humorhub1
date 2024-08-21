import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

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

export async function GET(request: NextRequest) {
  try {
    // Fetch data from Firestore
    const db = admin.firestore();
    const eventsRef = db.collection("userEvents");
    const snapshot = await eventsRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No events found." });
    }

    const eventCount = snapshot.size;
    const eventsArray: { id: string }[] = [];

    snapshot.forEach((doc) => {
      const event = doc.data();
      const eventId = doc.id;
      eventsArray.push({ id: eventId, ...event });
    });

    // Write the events to updated_events.json
    const eventsFilePath = path.join(process.cwd(), "updated_events.json");
    fs.writeFileSync(eventsFilePath, JSON.stringify(eventsArray, null, 2));

    // Update the event counter in Firestore
    const counterRef = db.collection("counters").doc("eventsCounter");
    await counterRef.set({ count: eventCount }, { merge: true });

    return NextResponse.json({
      message: "Events counted and updated.",
      count: eventCount,
    });
  } catch (error) {
    console.error("Error in count-events API:", error);
    return NextResponse.error();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Add data to Firestore
    const db = admin.firestore();
    await db.collection("your-collection-name").add(body);

    return NextResponse.json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    return NextResponse.error();
  }
}
