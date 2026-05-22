import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerDb } from "@/app/lib/firebase-admin";
import { COLLECTIONS, DEFAULT_POLL_ID } from "@/app/lib/constants";
import type { PollCounts } from "@/app/lib/types";
import { checkRateLimit, hasTrustedOrigin } from "@/app/lib/request-guards";

export const runtime = "nodejs";
const POLL_COOKIE_PREFIX = "hh_poll_vote_";

function normalizeCounts(data: Partial<PollCounts> | undefined) {
  const yesCount = Math.max(0, Number(data?.yesCount) || 0);
  const noCount = Math.max(0, Number(data?.noCount) || 0);
  const totalFromDoc = Math.max(0, Number(data?.totalCount) || 0);
  const inferredTotal = yesCount + noCount;

  return {
    yesCount,
    noCount,
    totalCount: Math.max(totalFromDoc, inferredTotal),
  };
}

const json = (body: any, status = 200) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const pollId = request.nextUrl.searchParams.get("id") ?? DEFAULT_POLL_ID;
  try {
    const snap = await getServerDb()
      .collection(COLLECTIONS.polls)
      .doc(pollId)
      .get();
    const counts = normalizeCounts(
      snap.data() as Partial<PollCounts> | undefined,
    );
    return json({ success: true, data: counts });
  } catch (error) {
    return json({ success: false, error: "Failed to load poll results" }, 500);
  }
}

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return json({ success: false, error: "Invalid request origin" }, 403);
  }

  const body = await request.json().catch(() => ({}));
  const pollId =
    typeof body.pollId === "string" && body.pollId.trim().length > 0
      ? body.pollId.trim()
      : DEFAULT_POLL_ID;

  const pollCookieName = `${POLL_COOKIE_PREFIX}${pollId.replace(/[^a-z0-9_-]/gi, "_")}`;
  const answer =
    body.answer === "yes" || body.answer === "no" ? body.answer : null;

  if (!answer) return json({ success: false, error: "Invalid answer" }, 400);

  if (request.cookies.get(pollCookieName)?.value === "1") {
    return json({ success: false, error: "You already voted recently." }, 409);
  }

  const rateLimit = checkRateLimit(request, {
    key: `poll:${pollId}`,
    windowMs: 3600000,
    maxRequests: 10,
  });

  if (!rateLimit.allowed) {
    return json({ success: false, error: "Too many votes submitted." }, 429);
  }

  try {
    const docRef = getServerDb().collection(COLLECTIONS.polls).doc(pollId);

    await docRef.set(
      {
        [`${answer}Count`]: FieldValue.increment(1),
        totalCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const snap = await docRef.get();
    const counts = normalizeCounts(
      snap.data() as Partial<PollCounts> | undefined,
    );

    const response = json({ success: true, data: counts });
    response.cookies.set(pollCookieName, "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error("Poll Error:", error);
    return json({ success: false, error: "Failed to record response" }, 500);
  }
}
