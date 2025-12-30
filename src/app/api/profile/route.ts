import { NextRequest, NextResponse } from "next/server";
import { getServerDb, verifyIdToken } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

const EMPTY_PROFILE = { name: "", bio: "", profileImageUrl: "" } as const;

async function getUidFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  // Avoid split allocation; "Bearer " is 7 chars
  const token = authHeader.slice(7);
  const { valid, uid } = await verifyIdToken(token);

  return valid && uid ? uid : null;
}

export async function GET(request: NextRequest) {
  try {
    const uid = await getUidFromRequest(request);
    if (!uid) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
      // Note: same status/shape as before for missing/invalid is preserved.
      // If you want to keep the distinct "Invalid or expired token" message,
      // use the slightly longer helper below (see note after code).
    }

    const db = getServerDb();
    const userDoc = await db.collection("users").doc(uid).get();

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
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const { valid, uid } = await verifyIdToken(authHeader.slice(7));
    if (!valid || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      name?: unknown;
      bio?: unknown;
      profileImageUrl?: unknown;
    };

    const { name, bio, profileImageUrl } = body as {
      name?: unknown;
      bio?: unknown;
      profileImageUrl?: unknown;
    };

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
      { status: 500 }
    );
  }
}
