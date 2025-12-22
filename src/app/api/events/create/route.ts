import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Server-side geocoding (Address -> Lat/Lng)
 * Falls back gracefully if Google fails or returns no results
 */
async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
}> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key not configured");
  }

  const url = new URL(GEOCODE_API_URL);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  url.searchParams.set("address", address);

  const response = await fetch(url.toString(), {
    method: "GET",
    // Prevent caching bad geocode responses
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed (${response.status})`);
  }

  const data = await response.json();

  if (data.status === "OK" && data.results?.length > 0) {
    const location = data.results[0]?.geometry?.location;

    if (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number"
    ) {
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
  }

  throw new Error(data.error_message || "No geocoding results");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventData } = body ?? {};

    if (!eventData || typeof eventData !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!eventData.name || !eventData.location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getServerDb();

    let collectionName = "events";
    let lat: number | undefined;
    let lng: number | undefined;

    try {
      const coords = await geocodeAddress(eventData.location);
      lat = coords.lat;
      lng = coords.lng;
    } catch (geocodeError) {
      console.warn(
        "Geocoding failed — sending event to manual review:",
        geocodeError
      );
      collectionName = "events_manual_review";
    }

    const dataToSave = {
      ...eventData,
      lat,
      lng,
      submissionDate: new Date().toISOString(),
    };

    await db.collection(collectionName).add(dataToSave);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event creation error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
