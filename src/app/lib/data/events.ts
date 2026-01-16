import { cache } from "react";
import { unstable_cache } from "next/cache";
import type {
  CityCoordinates,
  MicFinderData,
  Event,
  EventsByTab,
  EventCategory,
  MicFinderFilterResult,
} from "../types";
import { getServerDb } from "../firebase-admin";
import { buildEventFromData } from "../event-mappers";
import { COLLECTIONS, FEATURED_CITY, ALL_CITIES_LABEL } from "../constants";
import { sanitizeHtml } from "../sanitizeHtml";

export type MicFinderDataWithCities = MicFinderData & {
  cities: string[];
};

function normalizeTab(tab?: string): EventCategory {
  if (tab === "Festivals" || tab === "Other" || tab === "Mics") return tab;
  return "Mics";
}

function parseDateParam(dateParam?: string): Date | null {
  if (!dateParam) return null;
  const [year, month, day] = dateParam.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function buildFilterResult(
  eventsByTab: EventsByTab,
  params: { tab?: string; city?: string; date?: string }
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
        (event) => event.isRecurring && event.recurringDow === selectedDow
      )
    : [];

  const oneTimeEvents = isSpecificCity
    ? baseEvents.filter(
        (event) => !event.isRecurring && event.dateMs === dateCheckMs
      )
    : [];

  const allCityEvents = isAnyCity ? baseEvents : [];

  return { baseEvents, recurringEvents, oneTimeEvents, allCityEvents };
}

export function getMicFinderFilters(
  eventsByTab: EventsByTab,
  params: { tab?: string; city?: string; date?: string }
) {
  return buildFilterResult(eventsByTab, params);
}

const fetchFromFirestore = async (): Promise<MicFinderDataWithCities> => {
  try {
    const db = getServerDb();

    const [eventsSnap, citiesSnap] = await Promise.all([
      db
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
          "googleTimestamp"
        )
        .get(),
      db.collection(COLLECTIONS.cities).select("city", "coordinates").get(),
    ]);

    const eventsDocs = eventsSnap.docs;
    const events: Event[] = [];

    for (let i = 0; i < eventsDocs.length; i++) {
      const doc = eventsDocs[i];
      const data = doc.data();

      if (!data.name || !data.location) continue;

      const event = buildEventFromData(doc.id, data, {
        includeNormalizedCity: true,
        includeDerivedDates: true,
      });
      event.sanitizedDetails = sanitizeHtml(event.details);
      events.push(event);
    }

    events.sort((a, b) => {
      if (a.isSpokaneClub !== b.isSpokaneClub) {
        return a.isSpokaneClub ? -1 : 1;
      }
      return (b.numericTimestamp || 0) - (a.numericTimestamp || 0);
    });

    const eventsByTab: EventsByTab = {
      Mics: [],
      Festivals: [],
      Other: [],
    };

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.isFestival) {
        eventsByTab.Festivals.push(event);
      } else if (event.isMusic) {
        eventsByTab.Other.push(event);
      } else {
        eventsByTab.Mics.push(event);
      }
    }

    const citiesDocs = citiesSnap.docs;
    const cityCoordinates: CityCoordinates = {};
    const cities: string[] = [];

    for (let i = 0; i < citiesDocs.length; i++) {
      const data = citiesDocs[i].data();
      const city = data.city;
      const coordinates = data.coordinates;

      if (city && coordinates?.lat && coordinates?.lng) {
        cityCoordinates[city] = coordinates;
        cities.push(city);
      }
    }

    cities.sort((a, b) => {
      if (a === FEATURED_CITY) return -1;
      if (b === FEATURED_CITY) return 1;
      return a.localeCompare(b);
    });

    return { events, cityCoordinates, cities, eventsByTab };
  } catch (error) {
    console.error("[Server] Error fetching MicFinder data:", error);
    return {
      events: [],
      cityCoordinates: {},
      cities: [],
      eventsByTab: { Mics: [], Festivals: [], Other: [] },
    };
  }
};

const getCachedMicFinderData = unstable_cache(
  fetchFromFirestore,
  ["mic-finder-data"],
  { revalidate: 30 }
);

export const fetchMicFinderData = cache(getCachedMicFinderData);
