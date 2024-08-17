import admin, { ServiceAccount } from "firebase-admin";
import { NextResponse } from "next/server";
import serviceAccount from "../../../../humorhub-73ff9-firebase-adminsdk-oyk79-c27f399854.json";

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
}

const db = admin.firestore();

export async function GET() {
  try {
    const eventsRef = db.collection("userEvents");
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const snapshot = await eventsRef
      .where("googleTimestamp", ">=", oneWeekAgo.toISOString())
      .get();

    const eventCount = snapshot.size;

    return NextResponse.json({ count: eventCount });
  } catch (error) {
    console.error("Error fetching event count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
