"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/app/lib/firebase-admin";
import { COLLECTIONS } from "@/app/lib/constants";
import { requireUserId, type ActionResult } from "./shared";

export async function updateProfile(payload: {
  name?: string;
  bio?: string;
  profileImageUrl?: string;
}): Promise<ActionResult> {
  const uid = await requireUserId();
  if (!uid) return { success: false, error: "Not signed in" };

  const update: Record<string, string> = {};
  if (typeof payload.name === "string") update.name = payload.name;
  if (typeof payload.bio === "string") update.bio = payload.bio;
  if (typeof payload.profileImageUrl === "string") {
    update.profileImageUrl = payload.profileImageUrl;
  }

  try {
    const db = getServerDb();
    await db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .set(update, { merge: true });
    revalidatePath("/Profile");
    return { success: true };
  } catch (error) {
    console.error("Save profile error:", error);
    return { success: false, error: "Failed to save profile" };
  }
}
