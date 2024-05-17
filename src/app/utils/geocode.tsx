import axios from "axios";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

let API_KEY: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const getLatLng = async (address: string | number | boolean) => {
  try {
    const response = await axios.get(GEOCODE_API_URL, {
      params: {
        address: encodeURIComponent(address),
        key: API_KEY,
      },
    });

    if (response.data.status === "OK") {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("Failed to get latitude and longitude");
    }
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    throw error;
  }
};
