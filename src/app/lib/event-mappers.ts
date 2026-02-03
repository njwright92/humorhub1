import type { Event, EventData, GoogleTimestamp } from "./types";
import { DAY_MAP, SPOKANE_COMEDY_CLUB } from "./constants";
import { normalizeCityName, parseEventDate, parseTimestampToMs } from "./utils";

type MapOptions = {
  includeNormalizedCity: boolean;
  includeDerivedDates: boolean;
};

const DEFAULT_OPTIONS: MapOptions = {
  includeNormalizedCity: false,
  includeDerivedDates: false,
};

function toString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toBoolean(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === 1) return true;
  if (value === 0) return false;
  return false;
}

export function buildEventFromData(
  id: string,
  data: EventData,
  options: MapOptions = DEFAULT_OPTIONS,
): Event {
  const name = toString(data.name);
  const location = toString(data.location);
  const date = toString(data.date);
  const isRecurring = toBoolean(data.isRecurring);

  const locationLower = location.toLowerCase();
  const isSpokaneClub = location.includes(SPOKANE_COMEDY_CLUB);

  const cityPart = location.split(",")[1]?.trim() ?? "";
  const normalizedCity = options.includeNormalizedCity
    ? normalizeCityName(cityPart)
    : "";

  let recurringDow: number | null = null;
  let dateMs: number | null = null;

  if (options.includeDerivedDates) {
    if (isRecurring && date) {
      recurringDow = DAY_MAP[date] ?? null;
    }

    if (!isRecurring && date) {
      dateMs = parseEventDate(date)?.getTime() ?? null;
    }
  }

  const googleTimestamp = data.googleTimestamp as GoogleTimestamp;

  return {
    id,
    name,
    location,
    date,
    lat: toNumber(data.lat),
    lng: toNumber(data.lng),
    details: toString(data.details),
    isRecurring,
    isFestival: toBoolean(data.festival),
    isMusic: toBoolean(data.isMusic),
    numericTimestamp: parseTimestampToMs(googleTimestamp),
    googleTimestamp,
    locationLower,
    normalizedCity,
    isSpokaneClub,
    recurringDow,
    dateMs,
  };
}
