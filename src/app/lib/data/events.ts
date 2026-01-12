import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { CityCoordinates, MicFinderData, Event } from "../types";
import { getServerDb } from "../firebase-admin";
import { buildEventFromData } from "../event-mappers";
import { COLLECTIONS, FEATURED_CITY } from "../constants";

export type MicFinderDataWithCities = MicFinderData & {
  cities: string[];
};

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

      events.push(
        buildEventFromData(doc.id, data, {
          includeNormalizedCity: true,
          includeDerivedDates: true,
        })
      );
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
