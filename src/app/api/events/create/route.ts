import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import type {
  LatLng,
  EventSubmission,
  StoredEvent,
  ApiResponse,
} from "@/app/lib/types";

export const runtime = "nodejs";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface GeocodeResponse {
  status: string;
  results?: Array<{ geometry?: { location?: LatLng } }>;
  error_message?: string;
}

async function geocodeAddress(address: string): Promise<LatLng> {
  if (!GOOGLE_MAPS_API_KEY)
    throw new Error("Google Maps API key not configured");

  const url = new URL(GEOCODE_API_URL);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  url.searchParams.set("address", address);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`);

  const data: GeocodeResponse = await response.json();
  const location = data.results?.[0]?.geometry?.location;

  if (data.status === "OK" && location) return location;
  throw new Error(data.error_message ?? "No geocoding results");
}

function isValidSubmission(data: unknown): data is EventSubmission {
  if (typeof data !== "object" || data === null) return false;

  const { name, location, details, date, timestamp } = data as Record<
    string,
    unknown
  >;

  const hasRequiredStrings = [name, location, details].every(
    (field) => typeof field === "string" && field.trim() !== ""
  );

  const hasValidDate =
    typeof date === "string" || typeof timestamp === "string";

  return hasRequiredStrings && hasValidDate;
}

function json<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { eventData?: unknown };
    const eventData = body.eventData;

    if (!isValidSubmission(eventData)) {
      return json(
        { success: false, error: "Invalid or missing required fields" },
        400
      );
    }

    let coords: LatLng | undefined;
    let collection = "events";

    try {
      coords = await geocodeAddress(eventData.location);
    } catch (error) {
      console.warn("Geocoding failed, routing to manual review:", error);
      collection = "events_manual_review";
    }

    const storedEvent: StoredEvent = {
      ...eventData,
      ...coords,
      submissionDate: new Date().toISOString(),
    };

    const db = getServerDb();
    await db.collection(collection).add(storedEvent);

    return json({ success: true });
  } catch (error) {
    console.error("Event creation error:", error);
    return json({ success: false, error: "Failed to create event" }, 500);
  }
}
