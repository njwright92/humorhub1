import { NextResponse } from "next/server";
import { fetchMicFinderData, getMicFinderFilters } from "@/app/lib/data/events";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? undefined;
    const city = searchParams.get("city") ?? undefined;
    const date = searchParams.get("date") ?? undefined;

    const { eventsByTab } = await fetchMicFinderData();
    const filters = getMicFinderFilters(eventsByTab, { tab, city, date });

    return NextResponse.json(filters);
  } catch (error) {
    console.error("[API] Error filtering MicFinder events:", error);
    return NextResponse.json(
      {
        baseEvents: [],
        recurringEvents: [],
        oneTimeEvents: [],
        allCityEvents: [],
      },
      { status: 500 }
    );
  }
}
