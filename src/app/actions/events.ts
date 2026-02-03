"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/app/lib/firebase-admin";
import { COLLECTIONS, SAVED_EVENT_ALLOWED_FIELDS } from "@/app/lib/constants";
import { requireUserId, type ActionResult } from "./shared";

export async function saveEvent(
  eventData: Record<string, unknown>,
): Promise<ActionResult> {
  const uid = await requireUserId();
  if (!uid) return { success: false, error: "Not signed in" };

  const eventId = eventData.id;
  if (typeof eventId !== "string" || eventId.length === 0) {
    return { success: false, error: "Event ID is required" };
  }

  const dataToSave: Record<string, unknown> = {
    eventId,
    userId: uid,
    savedAt: new Date().toISOString(),
  };

  for (const field of SAVED_EVENT_ALLOWED_FIELDS) {
    const value = eventData[field];
    if (value != null) dataToSave[field] = value;
  }

  try {
    const db = getServerDb();
    const userEventId = `${uid}_${eventId}`;
    await db
      .collection(COLLECTIONS.savedEvents)
      .doc(userEventId)
      .set(dataToSave);
    revalidatePath("/Profile");
    return { success: true };
  } catch (error) {
    console.error("Save event error:", error);
    return { success: false, error: "Failed to save event" };
  }
}

export async function deleteSavedEvent(eventId: string): Promise<ActionResult> {
  const uid = await requireUserId();
  if (!uid) return { success: false, error: "Not signed in" };

  if (!eventId) {
    return { success: false, error: "Event ID is required" };
  }

  try {
    const db = getServerDb();
    const savedEvents = db.collection(COLLECTIONS.savedEvents);

    const userEventId = `${uid}_${eventId}`;
    const eventRef = savedEvents.doc(userEventId);
    let eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      const legacyRef = savedEvents.doc(eventId);
      const legacyDoc = await legacyRef.get();
      if (legacyDoc.exists) {
        eventDoc = legacyDoc;
      } else {
        return { success: false, error: "Event not found" };
      }
    }

    const data = eventDoc.data();
    if (data?.userId && data.userId !== uid) {
      return { success: false, error: "Unauthorized to delete this event" };
    }

    await eventDoc.ref.delete();
    revalidatePath("/Profile");
    return { success: true };
  } catch (error) {
    console.error("Delete event error:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
