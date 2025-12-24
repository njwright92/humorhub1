import { NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";

export async function GET(): Promise<Response> {
  try {
    const db = getServerDb();
    const snapshot = await db.collection("cities").get();

    const cities: string[] = [];

    for (const doc of snapshot.docs) {
      const city = doc.data().city;
      if (city) cities.push(city);
    }

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[API] Error fetching cities:", error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
