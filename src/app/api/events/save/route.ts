import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

const ALLOWED_FIELDS = [
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
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // faster than split
    const { valid, uid } = await verifyIdToken(token);

    if (!valid || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const eventData = (await request.json()) as Record<string, unknown>;

    const eventId = eventData.id;
    if (typeof eventId !== "string" || eventId.length === 0) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const savedAt = new Date().toISOString();

    const dataToSave: Record<string, unknown> = {
      id: eventId,
      userId: uid,
      savedAt,
    };

    for (const field of ALLOWED_FIELDS) {
      const value = eventData[field as AllowedField];
      if (value != null) dataToSave[field] = value;
    }

    const db = getServerDb();
    await db.collection("savedEvents").doc(eventId).set(dataToSave);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save event" },
      { status: 500 }
    );
  }
}
