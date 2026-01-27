"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerAuth, getServerDb } from "@/app/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth-session";
import { COLLECTIONS } from "@/app/lib/constants";

type ActionResult = { success: boolean; error?: string };

async function requireUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getServerAuth().verifySessionCookie(sessionCookie);
    return decoded.uid;
  } catch {
    return null;
  }
}

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
