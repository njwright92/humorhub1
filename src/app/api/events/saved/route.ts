import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import type { Event } from "@/app/lib/types";
import { buildEventFromData } from "@/app/lib/event-mappers";
import { COLLECTIONS, SAVED_EVENT_FIELDS } from "@/app/lib/constants";
import { sanitizeHtml } from "@/app/lib/sanitizeHtml";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const db = getServerDb();

    const snapshot = await db
      .collection(COLLECTIONS.savedEvents)
      .where("userId", "==", auth.uid)
      .select(...SAVED_EVENT_FIELDS)
      .get();

    const events: Event[] = [];

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();

      const eventId =
        typeof data.eventId === "string" && data.eventId.length > 0
          ? data.eventId
          : doc.id;

      const event = buildEventFromData(eventId, data);
      event.sanitizedDetails = event.details ? sanitizeHtml(event.details) : "";
      events.push(event);
    }

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("❌ [API] Fetch saved events error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch events" },
      500,
    );
  }
}
