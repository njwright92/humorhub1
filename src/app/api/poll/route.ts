import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerDb } from "@/app/lib/firebase-admin";
import { COLLECTIONS, DEFAULT_POLL_ID } from "@/app/lib/constants";

export const runtime = "nodejs";

const json = (body: any, status = 200) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const pollId = request.nextUrl.searchParams.get("id") ?? DEFAULT_POLL_ID;
  try {
    const snap = await getServerDb()
      .collection(COLLECTIONS.polls)
      .doc(pollId)
      .get();
    const data = snap.data() || {};
    return json({
      success: true,
      data: {
        yesCount: data.yesCount || 0,
        noCount: data.noCount || 0,
        totalCount: data.totalCount || 0,
      },
    });
  } catch (error) {
    return json({ success: false }, 500);
  }
}

export async function POST(request: NextRequest) {
  // 1. Simple Origin Check (Works better on Vercel)
  const origin =
    request.headers.get("origin") || request.headers.get("referer");
  if (
    origin &&
    !origin.includes("thehumorhub.com") &&
    !origin.includes("localhost")
  ) {
    return json({ success: false, error: "Unauthorized" }, 403);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const pollId = body.pollId || DEFAULT_POLL_ID;
    const answer = body.answer;

    if (answer !== "yes" && answer !== "no") {
      return json({ success: false, error: "Invalid answer" }, 400);
    }

    // 2. Cookie check
    const pollCookieName = `hh_poll_${pollId}`;
    if (request.cookies.get(pollCookieName)) {
      return json(
        { success: false, error: "You already voted recently." },
        409,
      );
    }

    // 3. Firestore Update
    const docRef = getServerDb().collection(COLLECTIONS.polls).doc(pollId);
    await docRef.set(
      {
        [`${answer}Count`]: FieldValue.increment(1),
        totalCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // 4. Return success and set cookie
    const snap = await docRef.get();
    const d = snap.data() || {};

    const response = json({
      success: true,
      data: {
        yesCount: d.yesCount || 0,
        noCount: d.noCount || 0,
        totalCount: d.totalCount || 0,
      },
    });

    response.cookies.set(pollCookieName, "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error("Poll POST error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
