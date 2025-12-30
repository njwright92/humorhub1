import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Event, CityCoordinates, MicFinderData } from "../types";
import { getServerDb } from "../firebase-admin";

export type MicFinderDataWithCities = MicFinderData & {
  cities: string[];
};

const FEATURED_CITY = "Spokane WA";

const fetchFromFirestore = async (): Promise<MicFinderDataWithCities> => {
  try {
    const db = getServerDb();

    // Projection: only fetch fields you actually use
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
      events.push({
        id: doc.id,
        name: data.name,
        location: data.location,
        date: data.date ?? "",
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        details: data.details ?? "",
        isRecurring: data.isRecurring ?? false,
        isFestival: data.festival === true,
        isMusic: data.isMusic === true,
        numericTimestamp,
        googleTimestamp: ts,
      });
    }

    const citiesDocs = citiesSnap.docs;
    const cityCoordinates: CityCoordinates = {};
    const cities: string[] = [];

    for (let i = 0; i < citiesDocs.length; i++) {
      const data = citiesDocs[i].data();
      const city = data.city;
      const coordinates = data.coordinates;

      // keeping your exact truthy checks (no logic change)
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
