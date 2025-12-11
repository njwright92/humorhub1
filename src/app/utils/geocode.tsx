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

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleResult {
  geometry: { location: LatLng };
  address_components: AddressComponent[];
}

interface GoogleResponse {
  status: string;
  results: GoogleResult[];
  error_message?: string;
}

export async function getLatLng(
  address?: string,
  latitude?: number,
  longitude?: number,
  city?: string,
  state?: string
): Promise<LatLng | CityAndState> {
  if (!API_KEY) {
    throw new Error("Configuration Error: Maps API Key not found.");
  }

  const url = new URL(GEOCODE_API_URL);
  url.searchParams.append("key", API_KEY);

  // Forward Geocoding (Address -> Lat/Lng)
  if (address) {
    const fullAddress =
      city && state ? `${address}, ${city}, ${state}` : address;
    url.searchParams.append("address", fullAddress);

    const response = await fetch(url.toString());
    if (!response.ok)
      throw new Error(`Geocoding Network Error: ${response.statusText}`);

    const data: GoogleResponse = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    throw new Error(data.error_message || "No results found for address.");
  }

  // Reverse Geocoding (Lat/Lng -> City/State)
  if (latitude !== undefined && longitude !== undefined) {
    url.searchParams.append("latlng", `${latitude},${longitude}`);

    const response = await fetch(url.toString());
    if (!response.ok)
      throw new Error(`Geocoding Network Error: ${response.statusText}`);

    const data: GoogleResponse = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      const components = data.results[0].address_components;
      let city: string | null = null;
      let state: string | null = null;

      for (const c of components) {
        if (!city && c.types.includes("locality")) city = c.long_name;
        if (!city && c.types.includes("administrative_area_level_2"))
          city = c.long_name;
        if (c.types.includes("administrative_area_level_1"))
          state = c.short_name;
        if (city && state) break;
      }

      return { city, state };
    }
    throw new Error(data.error_message || "No results found for coordinates.");
  }

  throw new Error("Invalid Input: Address or Coordinates required.");
}
