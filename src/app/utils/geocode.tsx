import axios from "axios";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

let API_KEY: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Types for geocoding results
interface LatLng {
  lat: number;
  lng: number;
}

interface CityName {
  city: string | null;
}

// Geocode function to handle both forward and reverse geocoding
export const getLatLng = async (
  address?: string | number | boolean,
  latitude?: number,
  longitude?: number
): Promise<LatLng | CityName> => {
  try {
    let response;

    if (address) {
      // Forward geocoding (address to coordinates)
      console.log(`Fetching coordinates for address: ${address}`);
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
      console.log(
        `Fetching city name for coordinates: ${latitude}, ${longitude}`
      );
      response = await axios.get(GEOCODE_API_URL, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: API_KEY,
        },
      });

      if (response.data.status === "OK") {
        const addressComponents = response.data.results[0].address_components;
        let city: string | null = null;

        for (const component of addressComponents) {
          if (component.types.includes("locality")) {
            city = component.long_name; // Get the city name
            break; // Exit loop once city is found
          }
        }
        return { city }; // Return city for reverse geocoding
      }
    } else {
      throw new Error(
        "Either an address or latitude/longitude must be provided."
      );
    }

    throw new Error("We couldn't retrieve the location details.");
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    throw new Error(
      "Oops! Something went wrong while fetching the location data. Please try again later."
    );
  }
};
