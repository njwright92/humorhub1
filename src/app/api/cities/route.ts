import { NextResponse } from "next/server";
import { fetchMicFinderData } from "@/app/lib/data/events";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const { cities } = await fetchMicFinderData();

    return NextResponse.json(
      { cities },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      },
    );
  } catch (error) {
    console.error("[API] Error fetching cities:", error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
