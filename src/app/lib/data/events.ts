import { cache } from "react";
import type { Event, CityCoordinates, MicFinderData } from "../types";
import { getServerDb } from "../firebase-admin";

export type MicFinderDataWithCities = MicFinderData & {
  cities: string[];
};

// Featured city appears first in dropdown
const FEATURED_CITY = "Spokane WA";

/**
 * Fetches all MicFinder data (events + cities) from Firestore.
 * Results are cached per request using React's cache().
 */
export const fetchMicFinderData = cache(
  async (): Promise<MicFinderDataWithCities> => {
    try {
      const db = getServerDb();

      // Parallel fetch for better performance
      const [eventsSnap, citiesSnap] = await Promise.all([
        db.collection("userEvents").get(),
        db.collection("cities").get(),
      ]);

      // Map events
      const events: Event[] = eventsSnap.docs.map((doc) => {
        const data = doc.data();
        const googleTimestamp = data.googleTimestamp;

        return {
          id: doc.id,
          name: data.name ?? "",
          location: data.location ?? "",
          date: data.date ?? "",
          lat: data.lat ?? 0,
          lng: data.lng ?? 0,
          details: data.details ?? "",
          isRecurring: data.isRecurring ?? false,
          festival: data.festival === true,
          isMusic: data.isMusic === true,
          numericTimestamp: googleTimestamp
            ? new Date(googleTimestamp).getTime()
            : 0,
          googleTimestamp,
        };
      });

      // Map cities and coordinates
      const cityCoordinates: CityCoordinates = {};
      const cities: string[] = [];

      for (const doc of citiesSnap.docs) {
        const { city, coordinates } = doc.data();
        if (city && coordinates?.lat && coordinates?.lng) {
          cityCoordinates[city] = {
            lat: coordinates.lat,
            lng: coordinates.lng,
          };
          cities.push(city);
        }
      }

      // Sort alphabetically, but featured city first
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
  }
);
