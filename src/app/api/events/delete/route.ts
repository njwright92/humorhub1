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
    const eventRef = db.collection(COLLECTIONS.savedEvents).doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return jsonResponse({ success: false, error: "Event not found" }, 404);
    }

    if (eventDoc.data()?.userId !== auth.uid) {
      return jsonResponse(
        { success: false, error: "Unauthorized to delete this event" },
        403,
      );
    }

    await eventRef.delete();
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return jsonResponse(
      { success: false, error: "Failed to delete event" },
      500,
    );
  }
}
