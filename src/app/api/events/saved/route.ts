import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import type { Event } from "@/app/lib/types";

export const runtime = "nodejs";

const SAVED_EVENT_FIELDS = [
  "name",
  "location",
  "date",
  "lat",
  "lng",
  "details",
  "isRecurring",
  "festival",
  "isMusic",
  "savedAt",
  "googleTimestamp",
] as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const db = getServerDb();

    const snapshot = await db
      .collection("savedEvents")
      .where("userId", "==", auth.uid)
      .select(...SAVED_EVENT_FIELDS)
      .get();

    const events: Event[] = [];

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();

      events.push({
        id: doc.id,
        name: data.name ?? "",
        location: data.location ?? "",
        date: data.date ?? "",
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        details: data.details ?? "",
        isRecurring: data.isRecurring ?? false,
        isFestival: data.festival === true,
        isMusic: data.isMusic === true,
        numericTimestamp: data.googleTimestamp
          ? new Date(data.googleTimestamp).getTime()
          : 0,
        googleTimestamp: data.googleTimestamp,
        locationLower: (data.location ?? "").toLowerCase(),
        normalizedCity: "",
        isSpokaneClub: (data.location ?? "").includes("Spokane Comedy Club"),
        recurringDow: null,
        dateMs: null,
      });
    }

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("❌ [API] Fetch saved events error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch events" },
      500
    );
  }
}
