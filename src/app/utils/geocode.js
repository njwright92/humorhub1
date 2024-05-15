import axios from "axios";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// Manually add your API key here
const API_KEY = "AIzaSyDlp_fnw6pLiPiWzieOtt9Kwro-3VPG0Rs";

export const getLatLng = async (address) => {
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
