import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";

export const runtime = "nodejs";

const EMPTY_PROFILE = { name: "", bio: "", profileImageUrl: "" } as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const db = getServerDb();
    const userDoc = await db.collection("users").doc(auth.uid).get();

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
      500
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

    const db = getServerDb();
    await db
      .collection("users")
      .doc(auth.uid)
      .set({ name, bio, profileImageUrl }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save profile error:", error);
    return jsonResponse(
      { success: false, error: "Failed to save profile" },
      500
    );
  }
}
