import { NextResponse } from "next/server";
import { fetchMicFinderData } from "@/app/lib/data/events";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const { cities } = await fetchMicFinderData();

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[API] Error fetching cities:", error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
