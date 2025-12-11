import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const { valid, uid } = await verifyIdToken(token);

    if (!valid || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const eventData = await request.json();

    if (!eventData.id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const db = getServerDb();

    const dataToSave: Record<string, unknown> = {
      id: eventData.id,
      userId: uid, // ✅ Make sure this is "userId" consistently
      savedAt: new Date().toISOString(),
    };

    const allowedFields = [
      "name",
      "location",
      "date",
      "lat",
      "lng",
      "details",
      "isRecurring",
      "festival",
      "isMusic",
      "googleTimestamp",
    ];

    allowedFields.forEach((field) => {
      if (eventData[field] != null) {
        dataToSave[field] = eventData[field];
      }
    });

    await db.collection("savedEvents").doc(eventData.id).set(dataToSave);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save event" },
      { status: 500 }
    );
  }
}
