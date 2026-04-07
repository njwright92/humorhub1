import { NextRequest } from "next/server";
import { getServerDb } from "@/app/lib/firebase-admin";
import { jsonResponse } from "@/app/lib/auth-helpers";
import type { LatLng, EventSubmission, StoredEvent } from "@/app/lib/types";
import { COLLECTIONS, GEOCODE_API_URL } from "@/app/lib/constants";
import { checkRateLimit, hasTrustedOrigin } from "@/app/lib/request-guards";

export const runtime = "nodejs";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 160;
const MAX_LOCATION_LENGTH = 240;
const MAX_DETAILS_LENGTH = 4000;
const MAX_EMAIL_LENGTH = 254;

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

  const { name, location, details, date, timestamp, email } = data as Record<
    string,
    unknown
  >;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedLocation = typeof location === "string" ? location.trim() : "";
  const trimmedDetails = typeof details === "string" ? details.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  const hasRequiredStrings =
    trimmedName.length > 0 &&
    trimmedName.length <= MAX_NAME_LENGTH &&
    trimmedLocation.length > 0 &&
    trimmedLocation.length <= MAX_LOCATION_LENGTH &&
    trimmedDetails.length > 0 &&
    trimmedDetails.length <= MAX_DETAILS_LENGTH;

  const hasValidDate =
    (typeof date === "string" && date.trim().length > 0) ||
    (typeof timestamp === "string" && timestamp.trim().length > 0);

  const hasValidEmail =
    trimmedEmail.length === 0 ||
    (trimmedEmail.length <= MAX_EMAIL_LENGTH &&
      EMAIL_PATTERN.test(trimmedEmail));

  return hasRequiredStrings && hasValidDate && hasValidEmail;
}

async function sendEventNotification(eventData: EventSubmission) {
  if (
    !process.env.EMAILJS_SERVICE_ID ||
    !process.env.EMAILJS_TEMPLATE_ID ||
    !process.env.EMAILJS_PUBLIC_KEY ||
    !process.env.EMAILJS_PRIVATE_KEY
  ) {
    console.warn("EmailJS env vars missing; skipping event notification.");
    return;
  }

  const parsedDate = eventData.date ? new Date(eventData.date) : null;
  const displayDate =
    parsedDate && !Number.isNaN(parsedDate.valueOf())
      ? parsedDate.toLocaleDateString("en-US")
      : "N/A";

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        name: eventData.name,
        location: eventData.location,
        date: displayDate,
        details: eventData.details,
        isRecurring: eventData.isRecurring ? "Yes" : "No",
        isFestival: eventData.isFestival ? "Yes" : "No",
        user_email: eventData.email || "No email provided",
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `EmailJS failed (${response.status})`);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasTrustedOrigin(request)) {
      return jsonResponse(
        { success: false, error: "Invalid request origin" },
        403,
      );
    }

    const rateLimit = checkRateLimit(request, {
      key: "event-submission",
      windowMs: 30 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      const response = jsonResponse(
        {
          success: false,
          error: "Too many event submissions. Please try again later.",
        },
        429,
      );
      response.headers.set(
        "Retry-After",
        String(Math.ceil(rateLimit.retryAfterMs / 1000)),
      );
      return response;
    }

    const body = (await request.json()) as { eventData?: unknown };
    const eventData = body.eventData;

    if (!isValidSubmission(eventData)) {
      return jsonResponse(
        { success: false, error: "Invalid or missing required fields" },
        400,
      );
    }

    let coords: LatLng | undefined;
    let collection: string = COLLECTIONS.events;

    try {
      coords = await geocodeAddress(eventData.location);
    } catch (error) {
      console.warn("Geocoding failed, routing to manual review:", error);
      collection = COLLECTIONS.eventsManualReview;
    }

    const storedEvent: StoredEvent = {
      ...eventData,
      name: eventData.name.trim(),
      location: eventData.location.trim(),
      details: eventData.details.trim(),
      email: typeof eventData.email === "string" ? eventData.email.trim() : "",
      ...coords,
      submissionDate: new Date().toISOString(),
    };

    const db = getServerDb();
    await db.collection(collection).add(storedEvent);

    try {
      await sendEventNotification(eventData);
    } catch (error) {
      console.warn("Event email failed:", error);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Event creation error:", error);
    return jsonResponse(
      { success: false, error: "Failed to create event" },
      500,
    );
  }
}
