import axios from "axios";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

let API_KEY: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Types for geocoding results
export interface LatLng {
  lat: number;
  lng: number;
}

export interface CityAndState {
  city: string | null;
  state: string | null;
}

// Geocode function to handle both forward and reverse geocoding
export const getLatLng = async (
  address?: string | number | boolean,
  latitude?: number,
  longitude?: number
): Promise<LatLng | CityAndState> => {
  try {
    let response;

    if (address) {
      // Forward geocoding (address to coordinates)
      response = await axios.get(GEOCODE_API_URL, {
        params: {
          address: encodeURIComponent(String(address)),
          key: API_KEY,
        },
      });

      if (response.data.status === "OK") {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng }; // Return lat/lng for address geocoding
      }
    } else if (latitude && longitude) {
      // Reverse geocoding (coordinates to address)

      response = await axios.get(GEOCODE_API_URL, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: API_KEY,
        },
      });

      if (response.data.status === "OK") {
        const addressComponents = response.data.results[0].address_components;
        let city: string | null = null;
        let state: string | null = null;

        for (const component of addressComponents) {
          if (component.types.includes("locality")) {
            city = component.long_name; // Get the city name
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name; // Get the state abbreviation
          }

          // Break early if both city and state are found
          if (city && state) break;
        }

        return { city, state }; // Return both city and state for reverse geocoding
      }
    } else {
      throw new Error(
        "Either an address or latitude/longitude must be provided."
      );
    }

    throw new Error("We couldn't retrieve the location details.");
  } catch (error) {
    throw new Error(
      "Oops! Something went wrong while fetching the location data. Please try again later."
    );
  }
};
