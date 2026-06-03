import { NextResponse } from "next/server";
import { fetchMicFinderData } from "@/app/lib/data/events";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { cityCoordinates } = await fetchMicFinderData();
    return NextResponse.json(
      { cityCoordinates },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ cityCoordinates: {} }, { status: 500 });
  }
}
