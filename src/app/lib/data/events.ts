import { cache } from "react";
import type { Event, CityCoordinates, MicFinderData } from "../types";
import { getServerDb } from "../firebase-admin";

// Update the return type
export type MicFinderDataWithCities = MicFinderData & {
  cities: string[];
};

export const fetchMicFinderData = cache(
  async (): Promise<MicFinderDataWithCities> => {
    try {
      const db = getServerDb();

      const [eventsSnap, citiesSnap] = await Promise.all([
        db.collection("userEvents").get(),
        db.collection("cities").get(),
      ]);

      const events: Event[] = eventsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          location: data.location || "",
          date: data.date || "",
          lat: data.lat || 0,
          lng: data.lng || 0,
          details: data.details || "",
          isRecurring: data.isRecurring || false,
          festival: data.festival === true,
          isMusic: data.isMusic === true,
          numericTimestamp: data.googleTimestamp
            ? new Date(data.googleTimestamp).getTime()
            : 0,
          googleTimestamp: data.googleTimestamp,
        };
      });

      const cityCoordinates: CityCoordinates = {};
      const cities: string[] = [];

      citiesSnap.docs.forEach((doc) => {
        const d = doc.data();
        if (d.city && d.coordinates) {
          cityCoordinates[d.city] = {
            lat: d.coordinates.lat,
            lng: d.coordinates.lng,
          };
          cities.push(d.city);
        }
      });

      // Sort cities with Spokane WA first
      cities.sort((a, b) =>
        a === "Spokane WA" ? -1 : b === "Spokane WA" ? 1 : a.localeCompare(b),
      );

      return { events, cityCoordinates, cities };
    } catch (error) {
      console.error("❌ [Server] Error fetching MicFinder data:", error);
      return { events: [], cityCoordinates: {}, cities: [] };
    }
  },
);
