"use client";
import React, { createContext, useContext, ReactNode } from "react";

// Define the CityContext and its initial value
const CityContext = createContext<any>(null);

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

const cityCoordinates: CityCoordinates = {
  "Spokane WA": { lat: 47.6588, lng: -117.426 },
  "Spokane Valley WA": { lat: 47.6733, lng: -117.2394 },
  "Coeur D'Alene ID": { lat: 47.6777, lng: -116.7805 },
  "Hayden ID": { lat: 47.766, lng: -116.7866 },
  "Post Falls ID": { lat: 47.718, lng: -116.9516 },
  "Sandpoint ID": { lat: 48.2766, lng: -116.5535 },
  "Cheney WA": { lat: 47.4894065, lng: -117.5800534 },
  "Medical Lake WA": { lat: 47.5686687, lng: -117.703776 },
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
