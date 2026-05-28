import { NextResponse } from "next/server";
import { fetchMicFinderData, getMicFinderFilters } from "@/app/lib/data/events";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? undefined;
    const city = searchParams.get("city") ?? undefined;
    const date = searchParams.get("date") ?? undefined;
    const view = searchParams.get("view");

    const { eventsByTab } = await fetchMicFinderData();
    const filters = getMicFinderFilters(eventsByTab, { tab, city, date });
    const body =
      view === "map"
        ? {
            baseEvents: [],
            recurringEvents: [],
            oneTimeEvents: [],
            allCityEvents: filters.allCityEvents.map(
              ({
                id,
                name,
                location,
                date,
                lat,
                lng,
                details,
                isFestival,
                isMusic,
              }) => ({
                id,
                name,
                location,
                date,
                lat,
                lng,
                details: details.slice(0, 120),
                isFestival,
                isMusic,
              }),
            ),
          }
        : filters;

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json(
      {
        baseEvents: [],
        recurringEvents: [],
        oneTimeEvents: [],
        allCityEvents: [],
      },
      { status: 500 },
    );
  }
}
