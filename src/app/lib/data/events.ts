import { cache } from "react";
import { unstable_cache } from "next/cache";
import type {
  CityCoordinates,
  Event,
  EventsByTab,
  EventCategory,
  MicFinderFilterResult,
} from "../types";
import { getServerDb } from "../firebase-admin";
import { buildEventFromData } from "../event-mappers";
import {
  COLLECTIONS,
  FEATURED_CITY,
  ALL_CITIES_LABEL,
  EVENT_CATEGORIES,
} from "../constants";

export type MicFinderDataWithCities = {
  cities: string[];
  cityCoordinates: CityCoordinates;
  eventsByTab: EventsByTab;
};

function normalizeTab(tab?: string): EventCategory {
  if (!tab) return EVENT_CATEGORIES[0];
  return EVENT_CATEGORIES.includes(tab as EventCategory)
    ? (tab as EventCategory)
    : EVENT_CATEGORIES[0];
}

function parseDateParam(dateParam?: string): Date | null {
  if (!dateParam) return null;
  const [year, month, day] = dateParam.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function buildFilterResult(
  eventsByTab: EventsByTab,
  params: { tab?: string; city?: string; date?: string },
): MicFinderFilterResult {
  const tab = normalizeTab(params.tab);
  const city = (params.city ?? "").trim();
  const cityLower = city.toLowerCase();
  const isAnyCity = cityLower.length > 0;
  const isSpecificCity =
    isAnyCity && cityLower !== ALL_CITIES_LABEL.toLowerCase();

  const date = parseDateParam(params.date) ?? new Date();
  const selectedDow = date.getDay();
  const dateCheck = new Date(date);
  dateCheck.setHours(0, 0, 0, 0);
  const dateCheckMs = dateCheck.getTime();

  const baseList = eventsByTab[tab] ?? [];
  const baseEvents = isSpecificCity
    ? baseList.filter((event) => event.locationLower.includes(cityLower))
    : baseList;

  const recurringEvents = isSpecificCity
    ? baseEvents.filter(
        (event) => event.isRecurring && event.recurringDow === selectedDow,
      )
    : [];

  const oneTimeEvents = isSpecificCity
    ? baseEvents.filter(
        (event) => !event.isRecurring && event.dateMs === dateCheckMs,
      )
    : [];

  const isAllCities = isAnyCity && cityLower === ALL_CITIES_LABEL.toLowerCase();
  const selectedDayEvents = baseEvents.filter(
    (event) =>
      (event.isRecurring && event.recurringDow === selectedDow) ||
      (!event.isRecurring && event.dateMs === dateCheckMs),
  );
  const allCityEvents = isAllCities
    ? selectedDayEvents
    : isAnyCity
      ? baseEvents
      : [];

  return {
    baseEvents: [],
    recurringEvents,
    oneTimeEvents,
    allCityEvents,
  };
}

export function getMicFinderFilters(
  eventsByTab: EventsByTab,
  params: { tab?: string; city?: string; date?: string },
) {
  return buildFilterResult(eventsByTab, params);
}

const fetchEventsFromFirestore = async (): Promise<{
  eventsByTab: EventsByTab;
}> => {
  try {
    const db = getServerDb();

    const eventsSnap = await db
      .collection(COLLECTIONS.userEvents)
      .select(
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
      )
      .get();

    const events: Event[] = [];

    for (const doc of eventsSnap.docs) {
      const data = doc.data();
      if (!data.name || !data.location) continue;
      events.push(
        buildEventFromData(doc.id, data, { includeDerivedDates: true }),
      );
    }

    events.sort((a, b) => {
      if (a.isSpokaneClub !== b.isSpokaneClub) return a.isSpokaneClub ? -1 : 1;
      return (b.numericTimestamp || 0) - (a.numericTimestamp || 0);
    });

    const eventsByTab: EventsByTab = { Mics: [], Festivals: [], Other: [] };

    for (const event of events) {
      if (event.isFestival) eventsByTab.Festivals.push(event);
      else if (event.isMusic) eventsByTab.Other.push(event);
      else eventsByTab.Mics.push(event);
    }

    return { eventsByTab };
  } catch {
    return { eventsByTab: { Mics: [], Festivals: [], Other: [] } };
  }
};

const fetchCitiesFromFirestore = async (): Promise<{
  cityCoordinates: CityCoordinates;
  cities: string[];
}> => {
  try {
    const db = getServerDb();

    const citiesSnap = await db
      .collection(COLLECTIONS.cities)
      .select("city", "coordinates")
      .get();

    const cityCoordinates: CityCoordinates = {};
    const cities: string[] = [];

    for (const doc of citiesSnap.docs) {
      const data = doc.data();
      const { city, coordinates } = data;
      if (
        typeof city === "string" &&
        city.trim().length > 0 &&
        typeof coordinates?.lat === "number" &&
        Number.isFinite(coordinates.lat) &&
        typeof coordinates?.lng === "number" &&
        Number.isFinite(coordinates.lng)
      ) {
        cityCoordinates[city] = coordinates;
        cities.push(city);
      }
    }

    cities.sort((a, b) => {
      if (a === FEATURED_CITY) return -1;
      if (b === FEATURED_CITY) return 1;
      return a.localeCompare(b);
    });

    return { cityCoordinates, cities };
  } catch {
    return { cityCoordinates: {}, cities: [] };
  }
};

const getCachedEvents = unstable_cache(
  fetchEventsFromFirestore,
  ["mic-finder-events"],
  { revalidate: 300 },
);

const getCachedCities = unstable_cache(
  fetchCitiesFromFirestore,
  ["mic-finder-cities"],
  { revalidate: 3600 },
);

export const fetchMicFinderData = cache(async () => {
  const [eventsData, citiesData] = await Promise.all([
    getCachedEvents(),
    getCachedCities(),
  ]);
  return { ...eventsData, ...citiesData };
});
