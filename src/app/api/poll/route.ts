import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerDb } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

const json = (body: any, status = 200) => NextResponse.json(body, { status });

const COLLECTION = "polls";
const DEFAULT_POLL_ID = "defaultPoll";

export async function GET(req: NextRequest) {
  try {
    const pollId = req.nextUrl.searchParams.get("id") || DEFAULT_POLL_ID;

    const snap = await getServerDb().collection(COLLECTION).doc(pollId).get();

    const data = snap.data() || {};

    return json({
      success: true,
      data: {
        yesCount: data.yesCount || 0,
        noCount: data.noCount || 0,
        totalCount: data.totalCount || 0,
      },
    });
  } catch (e) {
    console.error("Poll GET error:", e);
    return json({ success: false, error: "GET failed" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const pollId = body.pollId || DEFAULT_POLL_ID;
    const answer = body.answer;

    if (answer !== "yes" && answer !== "no") {
      return json({ success: false, error: "Invalid answer" }, 400);
    }

    const cookieName = `hh_poll_${pollId}`;

    if (req.cookies.get(cookieName)) {
      return json(
        { success: false, error: "You already voted recently." },
        409,
      );
    }

    const docRef = getServerDb().collection(COLLECTION).doc(pollId);

    await docRef.set(
      {
        [`${answer}Count`]: FieldValue.increment(1),
        totalCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const snap = await docRef.get();
    const data = snap.data() || {};

    const response = json({
      success: true,
      data: {
        yesCount: data.yesCount || 0,
        noCount: data.noCount || 0,
        totalCount: data.totalCount || 0,
      },
    });

    response.cookies.set(cookieName, "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (e) {
    console.error("Poll POST error:", e);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
