export const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const COLLECTIONS = {
  savedEvents: "savedEvents",
  userEvents: "userEvents",
  cities: "cities",
  users: "users",
  events: "events",
  eventsManualReview: "events_manual_review",
} as const;

export const FEATURED_CITY = "Spokane WA";
export const SPOKANE_COMEDY_CLUB = "Spokane Comedy Club";
export const ALL_CITIES_LABEL = "all cities";
export const CITIES_CACHE_KEY = "hh_cities";

export const NEWS_API_DEFAULTS = {
  locale: "us,ca",
  language: "en",
  limit: "10",
} as const;

export const NEWS_CACHE_HEADERS = {
  "Cache-Control": "max-age=300",
} as const;

export const GEOCODE_API_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";

export const SAVED_EVENT_FIELDS = [
  "userId",
  "eventId",
  "name",
  "location",
  "date",
  "lat",
  "lng",
  "details",
  "isRecurring",
  "festival",
  "isMusic",
  "savedAt",
  "googleTimestamp",
] as const;

export const SAVED_EVENT_ALLOWED_FIELDS = [
  "name",
  "location",
  "date",
  "lat",
  "lng",
  "details",
  "isRecurring",
  "festival",
  "isMusic",
  "googleTimestamp",
] as const;

export const DEFAULT_US_CENTER = { lat: 39.8283, lng: -98.5795 };
export const DEFAULT_ZOOM = 4;
export const CITY_ZOOM = 12;
