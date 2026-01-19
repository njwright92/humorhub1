import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import { COLLECTIONS } from "@/app/lib/constants";

export const runtime = "nodejs";

const EMPTY_PROFILE = { name: "", bio: "", profileImageUrl: "" } as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const db = getServerDb();
    const userDoc = await db.collection(COLLECTIONS.users).doc(auth.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ success: true, profile: EMPTY_PROFILE });
    }

    const data = userDoc.data();
    return NextResponse.json({
      success: true,
      profile: {
        name: data?.name || "",
        bio: data?.bio || "",
        profileImageUrl: data?.profileImageUrl || "",
      },
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch profile" },
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { name, bio, profileImageUrl } = (await request.json()) as {
      name?: string;
      bio?: string;
      profileImageUrl?: string;
    };

    const update: Record<string, string> = {};
    if (typeof name === "string") update.name = name;
    if (typeof bio === "string") update.bio = bio;
    if (typeof profileImageUrl === "string") {
      update.profileImageUrl = profileImageUrl;
    }

    const db = getServerDb();
    await db
      .collection(COLLECTIONS.users)
      .doc(auth.uid)
      .set(update, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save profile error:", error);
    return jsonResponse(
      { success: false, error: "Failed to save profile" },
      500,
    );
  }
}
