import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getServerDb } from "@/app/lib/firebase-admin";
import { COLLECTIONS } from "@/app/lib/constants";

const DEFAULT_POLL_ID = "homepage_v2";

type PollCounts = {
  yesCount: number;
  noCount: number;
  totalCount: number;
};

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
  const body = await request.json().catch(() => ({}));
  const pollId =
    typeof body.pollId === "string" && body.pollId.trim().length > 0
      ? body.pollId.trim()
      : DEFAULT_POLL_ID;
  const normalizedAnswer =
    body.answer === "yes" || body.answer === "no" ? body.answer : null;

  if (!normalizedAnswer) {
    return json({ success: false, error: "Invalid answer" }, 400);
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

    return json({ success: true, data: counts });
  } catch (error) {
    console.error("Poll POST error:", error);
    return json({ success: false, error: "Failed to record response" }, 500);
  }
}
