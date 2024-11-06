import axios from "axios";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
  state?: string
): Promise<LatLng | CityAndState> => {
  try {
    let response;

    if (address) {
      // Use address, city, and state for precision
      const fullAddress =
        city && state ? `${address}, ${city}, ${state}` : address;
      response = await axios.get(GEOCODE_API_URL, {
        params: {
          address: fullAddress,
          key: API_KEY,
        },
      });

      if (response.data.status === "OK") {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      }
    } else if (latitude && longitude) {
      // Reverse geocode from coordinates
      response = await axios.get(GEOCODE_API_URL, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: API_KEY,
        },
      });

      if (response.data.status === "OK") {
        const components = response.data.results[0].address_components;
        let city = null;
        let state = null;

        for (const component of components) {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }

          if (city && state) break;
        }

        return { city, state };
      }
    } else {
      throw new Error("An address or latitude/longitude must be provided.");
    }

    throw new Error("Location details could not be retrieved.");
  } catch (error) {
    throw new Error("Error fetching location data. Please try again later.");
  }
};
