import { NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";

export async function GET() {
  try {
    const db = getServerDb();
    const snapshot = await db.collection("cities").get();

    const cities = snapshot.docs.map((doc) => doc.data()?.city).filter(Boolean);

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
