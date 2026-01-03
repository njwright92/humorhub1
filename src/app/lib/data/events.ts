import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Event, CityCoordinates, MicFinderData } from "../types";
import { getServerDb } from "../firebase-admin";
import { normalizeCityName } from "../utils";
import { DAY_MAP } from "../constants";

export type MicFinderDataWithCities = MicFinderData & {
  cities: string[];
};

const FEATURED_CITY = "Spokane WA";

const fetchFromFirestore = async (): Promise<MicFinderDataWithCities> => {
  try {
    const db = getServerDb();

    const [eventsSnap, citiesSnap] = await Promise.all([
      db
        .collection("userEvents")
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
      db.collection("cities").select("city", "coordinates").get(),
    ]);

    const eventsDocs = eventsSnap.docs;
    const events: Event[] = [];

    for (let i = 0; i < eventsDocs.length; i++) {
      const doc = eventsDocs[i];
      const data = doc.data();

      if (!data.name || !data.location) continue;

      const ts = data.googleTimestamp;
      const numericTimestamp = ts
        ? new Date(ts as unknown as string | number | Date).getTime()
        : 0;

      const name = data.name as string;
      const location = data.location as string;
      const date = (data.date as string) ?? "";
      const isRecurring = (data.isRecurring as boolean) ?? false;

      const locationLower = location.toLowerCase();

      const cityPart = location.split(",")[1]?.trim() ?? "";
      const normalizedCity = normalizeCityName(cityPart);

      const isSpokaneClub = location.includes("Spokane Comedy Club");

      let recurringDow: number | null = null;
      if (isRecurring && date) {
        recurringDow = DAY_MAP[date] ?? null;
      }

      let dateMs: number | null = null;
      if (!isRecurring && date) {
        const parsed = new Date(date);
        if (!Number.isNaN(parsed.getTime())) {
          parsed.setHours(0, 0, 0, 0);
          dateMs = parsed.getTime();
        }
      }

      events.push({
        id: doc.id,
        name,
        location,
        date,
        lat: (data.lat as number) ?? 0,
        lng: (data.lng as number) ?? 0,
        details: (data.details as string) ?? "",
        isRecurring,
        isFestival: data.festival === true,
        isMusic: data.isMusic === true,
        numericTimestamp,
        googleTimestamp: ts,
        locationLower,
        normalizedCity,
        isSpokaneClub,
        recurringDow,
        dateMs,
      });
    }

    events.sort((a, b) => {
      if (a.isSpokaneClub !== b.isSpokaneClub) {
        return a.isSpokaneClub ? -1 : 1;
      }
      return (b.numericTimestamp || 0) - (a.numericTimestamp || 0);
    });

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

    return { events, cityCoordinates, cities };
  } catch (error) {
    console.error("[Server] Error fetching MicFinder data:", error);
    return { events: [], cityCoordinates: {}, cities: [] };
  }
};

const getCachedMicFinderData = unstable_cache(
  fetchFromFirestore,
  ["mic-finder-data"],
  { revalidate: 30 }
);

export const fetchMicFinderData = cache(getCachedMicFinderData);
