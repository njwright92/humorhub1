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

    const [eventsSnap, citiesSnap] = await Promise.all([
      db.collection("userEvents").get(),
      db.collection("cities").get(),
    ]);

    const events: Event[] = [];
    for (const doc of eventsSnap.docs) {
      const data = doc.data();
      if (!data.name || !data.location) continue;

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
        numericTimestamp: data.googleTimestamp
          ? new Date(data.googleTimestamp).getTime()
          : 0,
        googleTimestamp: data.googleTimestamp,
      });
    }

    const cityCoordinates: CityCoordinates = {};
    const cities: string[] = [];

    for (const doc of citiesSnap.docs) {
      const { city, coordinates } = doc.data();
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
