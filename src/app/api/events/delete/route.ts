import { NextRequest } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import { COLLECTIONS } from "@/app/lib/constants";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { eventId } = (await request.json()) as { eventId?: string };

    if (!eventId) {
      return jsonResponse(
        { success: false, error: "Event ID is required" },
        400,
      );
    }

    const db = getServerDb();
    const userEventId = `${auth.uid}_${eventId}`;
    const savedEvents = db.collection(COLLECTIONS.savedEvents);

    // Prefer the new per-user doc id, but fall back to legacy doc id for older saves.
    const eventRef = savedEvents.doc(userEventId);
    let eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      const legacyRef = savedEvents.doc(eventId);
      const legacyDoc = await legacyRef.get();
      if (legacyDoc.exists) {
        eventDoc = legacyDoc;
      } else {
        return jsonResponse({ success: false, error: "Event not found" }, 404);
      }
    }

    const data = eventDoc.data();
    if (data?.userId && data.userId !== auth.uid) {
      return jsonResponse(
        { success: false, error: "Unauthorized to delete this event" },
        403,
      );
    }

    await eventDoc.ref.delete();
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return jsonResponse(
      { success: false, error: "Failed to delete event" },
      500,
    );
  }
}
