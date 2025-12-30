import { NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const db = getServerDb();

    const snapshot = await db.collection("cities").select("city").get();

    const docs = snapshot.docs;
    const cities: string[] = [];

    for (let i = 0; i < docs.length; i++) {
      const city = docs[i].get("city") as unknown as string | undefined;
      if (city) cities.push(city);
    }

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[API] Error fetching cities:", error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
