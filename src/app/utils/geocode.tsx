const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// --- 1. Return Types ---
export interface LatLng {
  lat: number;
  lng: number;
}

export interface CityAndState {
  city: string | null;
  state: string | null;
}

// --- 2. Google API Response Types (For Strict Safety) ---
interface GoogleResult {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

interface GoogleResponse {
  status: string;
  results: GoogleResult[];
  error_message?: string;
}

// --- 3. The Function ---
export const getLatLng = async (
  address?: string,
  latitude?: number,
  longitude?: number,
  city?: string,
  state?: string,
): Promise<LatLng | CityAndState> => {
  // Safety Check
  if (!API_KEY) {
    console.error("Google Maps API Key is missing.");
    throw new Error("Configuration Error: Maps API Key not found.");
  }

  try {
    const url = new URL(GEOCODE_API_URL);
    url.searchParams.append("key", API_KEY);

    // --- SCENARIO A: Forward Geocoding (Address -> Lat/Lng) ---
    if (address) {
      const fullAddress =
        city && state ? `${address}, ${city}, ${state}` : address;

      url.searchParams.append("address", fullAddress);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Geocoding Network Error: ${response.statusText}`);
      }

      const data: GoogleResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        throw new Error(data.error_message || "No results found for address.");
      }
    }

    // --- SCENARIO B: Reverse Geocoding (Lat/Lng -> City/State) ---
    else if (latitude !== undefined && longitude !== undefined) {
      url.searchParams.append("latlng", `${latitude},${longitude}`);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Geocoding Network Error: ${response.statusText}`);
      }

      const data: GoogleResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const components = data.results[0].address_components;
        let foundCity = null;
        let foundState = null;

        for (const component of components) {
          if (component.types.includes("locality")) {
            foundCity = component.long_name;
          }
          // Fallback to administrative_area_level_2 (County) if locality missing
          if (
            !foundCity &&
            component.types.includes("administrative_area_level_2")
          ) {
            foundCity = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            foundState = component.short_name;
          }

          if (foundCity && foundState) break;
        }

        return { city: foundCity, state: foundState };
      } else {
        throw new Error(
          data.error_message || "No results found for coordinates.",
        );
      }
    }

    // --- SCENARIO C: Missing Inputs ---
    else {
      throw new Error("Invalid Input: Address or Coordinates required.");
    }
  } catch (error) {
    console.error("Geocode Utility Error:", error);
    // Throw a clean error for the UI to catch
    throw new Error("Unable to verify location. Please check the address.");
  }
};
