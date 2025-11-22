const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CityAndState {
  city: string | null;
  state: string | null;
}

export const getLatLng = async (
  address?: string,
  latitude?: number,
  longitude?: number,
  city?: string,
  state?: string,
): Promise<LatLng | CityAndState> => {
  try {
    const url = new URL(GEOCODE_API_URL);
    url.searchParams.append("key", API_KEY);

    if (address) {
      // --- 1. Forward Geocoding (Address -> Lat/Lng) ---
      const fullAddress =
        city && state ? `${address}, ${city}, ${state}` : address;

      url.searchParams.append("address", fullAddress);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Geocoding API Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
    } else if (latitude && longitude) {
      // --- 2. Reverse Geocoding (Lat/Lng -> City/State) ---
      url.searchParams.append("latlng", `${latitude},${longitude}`);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Geocoding API Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "OK") {
        const components = data.results[0].address_components;
        let foundCity = null;
        let foundState = null;

        for (const component of components) {
          // Note: 'types' is an array of strings
          if (component.types.includes("locality")) {
            foundCity = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            foundState = component.short_name;
          }

          if (foundCity && foundState) break;
        }

        return { city: foundCity, state: foundState };
      }
    } else {
      throw new Error("An address or latitude/longitude must be provided.");
    }

    throw new Error("Location details could not be retrieved.");
  } catch (error) {
    // Keep your generic error message for the UI
    console.error("Geocode Error:", error); // Helpful for debugging
    throw new Error("Error fetching location data. Please try again later.");
  }
};
