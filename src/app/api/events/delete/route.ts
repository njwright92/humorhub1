import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";
import type { ApiResponse } from "@/app/lib/types";

function json<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(
        { success: false, error: "Missing authorization header" },
        401
      );
    }

    const { valid, uid } = await verifyIdToken(authHeader.slice(7));
    if (!valid || !uid) {
      return json({ success: false, error: "Invalid or expired token" }, 401);
    }

    const { eventId } = await request.json();
    if (!eventId) {
      return json({ success: false, error: "Event ID is required" }, 400);
    }

    const db = getServerDb();
    const eventRef = db.collection("savedEvents").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return json({ success: false, error: "Event not found" }, 404);
    }

    if (eventDoc.data()?.userId !== uid) {
      return json(
        { success: false, error: "Unauthorized to delete this event" },
        403
      );
    }

    await eventRef.delete();

    return json({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return json({ success: false, error: "Failed to delete event" }, 500);
  }
}
