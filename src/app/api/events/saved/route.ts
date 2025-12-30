import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

interface SavedEventData {
  id: string;
  name?: string;
  location?: string;
  date?: string;
  lat?: number;
  lng?: number;
  details?: string;
  isRecurring?: boolean;
  festival?: boolean;
  isMusic?: boolean;
  userId?: string;
  savedAt?: string;
  googleTimestamp?: string | number | Date;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const { valid, uid } = await verifyIdToken(token);

    if (!valid || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const db = getServerDb();

    const snapshot = await db
      .collection("savedEvents")
      .where("userId", "==", uid)
      .select(
        "name",
        "location",
        "date",
        "lat",
        "lng",
        "details",
        "isRecurring",
        "festival",
        "isMusic",
        "userId",
        "savedAt",
        "googleTimestamp"
      )
      .get();

    const events: SavedEventData[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        location: data.location,
        date: data.date,
        lat: data.lat,
        lng: data.lng,
        details: data.details,
        isRecurring: data.isRecurring,
        festival: data.festival,
        isMusic: data.isMusic,
        userId: data.userId,
        savedAt: data.savedAt,
        googleTimestamp: data.googleTimestamp,
      };
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("❌ [API] Fetch saved events error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
