import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const { valid, uid } = await verifyIdToken(token);

    if (!valid || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 },
      );
    }

    const db = getServerDb();

    // Verify the event belongs to this user before deleting
    const eventDoc = await db.collection("savedEvents").doc(eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    const eventData = eventDoc.data();
    if (eventData?.userId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this event" },
        { status: 403 },
      );
    }

    await db.collection("savedEvents").doc(eventId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
