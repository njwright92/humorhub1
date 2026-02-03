import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import type { Event } from "@/app/lib/types";
import { mapSavedEventDocs } from "@/app/lib/saved-events";
import { COLLECTIONS, SAVED_EVENT_FIELDS } from "@/app/lib/constants";

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

    const events: Event[] = mapSavedEventDocs(snapshot.docs);

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("❌ [API] Fetch saved events error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch events" },
      500,
    );
  }
}
