import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventData, collectionName } = body;

    if (!eventData || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Invalid data" },
        { status: 400 },
      );
    }

    const db = getServerDb();

    // Add server-side timestamp
    const dataToSave = {
      ...eventData,
      submissionDate: new Date().toISOString(),
    };

    await db.collection(collectionName).add(dataToSave);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 },
    );
  }
}
