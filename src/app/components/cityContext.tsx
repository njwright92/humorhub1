"use client";
import React, { createContext, useContext, ReactNode } from "react";

// Define the CityContext and its initial value
const CityContext = createContext<any>(null);

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

const cityCoordinates: CityCoordinates = {
  Albuquerque: { lat: 35.0844, lng: -106.6504 },
  Anchorage: { lat: 61.2181, lng: -149.9003 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  billings: { lat: 45.7833, lng: -108.5007 },
  Boise: { lat: 43.615, lng: -116.2023 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Bozeman: { lat: 45.6769, lng: -111.0429 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  "Coeur D'Alene": { lat: 47.6777, lng: -116.7805 },
  Cheney: { lat: 47.4894065, lng: -117.5800534 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Detroit: { lat: 42.3314, lng: -83.0458 },
  Hayden: { lat: 47.766, lng: -116.7866 },
  Honolulu: { lat: 21.3069, lng: -157.8583 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  "Medical Lake": { lat: 47.5686687, lng: -117.703776 },
  Minneapolis: { lat: 44.9778, lng: -93.265 },
  Milwaukee: { lat: 43.0389, lng: -87.9065 },
  Moscow: { lat: 46.7324, lng: -117.0002 },
  Nashville: { lat: 36.1627, lng: -86.7816 },
  "New Orleans": { lat: 29.9511, lng: -90.0715 },
  "New York": { lat: 40.7128, lng: -74.006 },
  "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
  Phoenix: { lat: 33.4484, lng: -112.074 },
  Portland: { lat: 45.5051, lng: -122.675 },
  Pocatello: { lat: 42.8713, lng: -112.4455 },
  "Post Falls": { lat: 47.718, lng: -116.9516 },
  Queens: { lat: 40.7282, lng: -73.7949 },
  "Salt Lake City": { lat: 40.7608, lng: -111.891 },
  "San Diego": { lat: 32.7157, lng: -117.1611 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  "Spokane Valley": { lat: 47.6733, lng: -117.2394 },
  Spokane: { lat: 47.6588, lng: -117.426 },
  Tacoma: { lat: 47.2529, lng: -122.4443 },
  Washington: { lat: 38.9072, lng: -77.0369 },
};

const extractCityNames = (coordinates: CityCoordinates) => {
  const cityNames: CityCoordinates = {};
  Object.keys(coordinates).map((key) => {
    const cityName = key.split(",")[0].trim(); // Extract city name and trim any extra spaces
    return (cityNames[cityName] = coordinates[key]);
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
import PropTypes from "prop-types";

export const CityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <CityContext.Provider value={sanitizedCityCoordinates}>
      {children}
    </CityContext.Provider>
  );
};

CityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
