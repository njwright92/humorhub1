import { NextRequest } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import { COLLECTIONS, SAVED_EVENT_ALLOWED_FIELDS } from "@/app/lib/constants";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const eventData = (await request.json()) as Record<string, unknown>;

    const eventId = eventData.id;
    if (typeof eventId !== "string" || eventId.length === 0) {
      return jsonResponse(
        { success: false, error: "Event ID is required" },
        400
      );
    }

    const dataToSave: Record<string, unknown> = {
      id: eventId,
      userId: auth.uid,
      savedAt: new Date().toISOString(),
    };

    for (const field of SAVED_EVENT_ALLOWED_FIELDS) {
      const value = eventData[field];
      if (value != null) dataToSave[field] = value;
    }

    const db = getServerDb();
    await db.collection(COLLECTIONS.savedEvents).doc(eventId).set(dataToSave);

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Save event error:", error);
    return jsonResponse({ success: false, error: "Failed to save event" }, 500);
  }
}
