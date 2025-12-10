import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";

export async function GET(request: NextRequest) {
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

    const db = getServerDb();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({
        success: true,
        profile: { name: "", bio: "", profileImageUrl: "" },
      });
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
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { name, bio, profileImageUrl } = await request.json();

    const db = getServerDb();
    await db
      .collection("users")
      .doc(uid)
      .set({ name, bio, profileImageUrl }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save profile" },
      { status: 500 },
    );
  }
}
