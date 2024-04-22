"use client";
import React, { createContext, useContext, ReactNode } from "react";

// Define the CityContext and its initial value
const CityContext = createContext<any>(null);

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

const cityCoordinates: CityCoordinates = {
  "Los Angeles CA": { lat: 34.0522, lng: -118.2437 },
  "San Diego CA": { lat: 32.7157, lng: -117.1611 },
  "San Francisco CA": { lat: 37.7749, lng: -122.4194 },
  "Miami FL": { lat: 25.7617, lng: -80.1918 },
  "Maui HA": { lat: 20.7984, lng: -156.3319 },
  "Boise ID": { lat: 43.615, lng: -116.2023 },
  "Coeur D'Alene ID": { lat: 47.6777, lng: -116.7805 },
  "Hayden ID": { lat: 47.766, lng: -116.7866 },
  "Moscow ID": { lat: 46.7324, lng: -117.0002 },
  "Post Falls ID": { lat: 47.718, lng: -116.9516 },
  "Sandpoint ID": { lat: 48.2766, lng: -116.5535 },
  "Boston MA": { lat: 42.3601, lng: -71.0589 },
  "New York City NY": { lat: 40.7128, lng: -74.006 },
  "Portland OR": { lat: 45.5051, lng: -122.675 },
  "Austin TX": { lat: 30.2672, lng: -97.7431 },
  "Salt Lake City UT": { lat: 40.7608, lng: -111.891 },
  "Cheney WA": { lat: 47.4894065, lng: -117.5800534 },
  "Medical Lake WA": { lat: 47.5686687, lng: -117.703776 },
  "Seattle WA": { lat: 47.6062, lng: -122.3321 },
  "Spokane Valley WA": { lat: 47.6733, lng: -117.2394 },
  "Spokane WA": { lat: 47.6588, lng: -117.426 },
  "phoenix AZ": { lat: 33.4484, lng: -112.074 },
  "tacoma WA": { lat: 47.2529, lng: -122.4443 },
  "minneapolis MN": { lat: 44.9778, lng: -93.265 },
  "detroit MI": { lat: 42.3314, lng: -83.0458 },
  "new orleans LA": { lat: 29.9511, lng: -90.0715 },
  "los vegas NV": { lat: 36.1699, lng: -115.1398 },
  "oklahoma city OK": { lat: 35.4676, lng: -97.5164 },
};

// Function to extract city names from cityCoordinates
const extractCityNames = (coordinates: CityCoordinates) => {
  const cityNames: CityCoordinates = {};
  Object.keys(coordinates).forEach((key) => {
    const cityName = key.split(",")[0].trim(); // Extract city name and trim any extra spaces
    cityNames[cityName] = coordinates[key];
  });
  return cityNames;
};

// Sanitized city coordinates with just the city names
const sanitizedCityCoordinates = extractCityNames(cityCoordinates);

// Create a custom hook to simplify using the CityContext
export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
};

// Create the CityProvider component
export const CityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <CityContext.Provider value={sanitizedCityCoordinates}>
      {children}
    </CityContext.Provider>
  );
};
