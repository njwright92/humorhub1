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

function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(request: NextRequest) {
  const pollId = request.nextUrl.searchParams.get("id") ?? DEFAULT_POLL_ID;

  try {
    const db = getServerDb();
    const docRef = db.collection(COLLECTIONS.polls).doc(pollId);
    const snap = await docRef.get();
    const counts = normalizeCounts(
      snap.data() as Partial<PollCounts> | undefined,
    );

    return json({ success: true, data: counts });
  } catch (error) {
    console.error("Poll GET error:", error);
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
  const normalizedAnswer =
    body.answer === "yes" || body.answer === "no" ? body.answer : null;

  if (!normalizedAnswer) {
    return json({ success: false, error: "Invalid answer" }, 400);
  }

  if (request.cookies.get(pollCookieName)?.value === "1") {
    return json({ success: false, error: "You already voted recently." }, 409);
  }

  const rateLimit = checkRateLimit(request, {
    key: `poll:${pollId}`,
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  });

  if (!rateLimit.allowed) {
    const response = json(
      { success: false, error: "Too many votes submitted. Please slow down." },
      429,
    );
    response.headers.set(
      "Retry-After",
      String(Math.ceil(rateLimit.retryAfterMs / 1000)),
    );
    return response;
  }

  try {
    const db = getServerDb();
    const docRef = db.collection(COLLECTIONS.polls).doc(pollId);
    const incrementYes = normalizedAnswer === "yes" ? 1 : 0;
    const incrementNo = normalizedAnswer === "no" ? 1 : 0;

    await docRef.set(
      {
        yesCount: FieldValue.increment(incrementYes),
        noCount: FieldValue.increment(incrementNo),
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("Poll POST error:", error);
    return json({ success: false, error: "Failed to record response" }, 500);
  }
}
