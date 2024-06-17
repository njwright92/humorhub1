"use client";

import React, { createContext, useContext, ReactNode } from "react";

const CityContext = createContext<any>(null);

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

const cityCoordinates: CityCoordinates = {
  Albuquerque: { lat: 35.0844, lng: -106.6504 },
  Anchorage: { lat: 61.2181, lng: -149.9003 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Billings: { lat: 45.7833, lng: -108.5007 },
  Boise: { lat: 43.615, lng: -116.2023 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Bozeman: { lat: 45.6769, lng: -111.0429 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  Bronx: { lat: 40.8448, lng: -73.8648 },
  Cheney: { lat: 47.4894065, lng: -117.5800534 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  "Coeur D'Alene": { lat: 47.6777, lng: -116.7805 },
  Detroit: { lat: 42.3314, lng: -83.0458 },
  Hayden: { lat: 47.766, lng: -116.7866 },
  Honolulu: { lat: 21.3069, lng: -157.8583 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "Medical Lake": { lat: 47.5686687, lng: -117.703776 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  Milwaukee: { lat: 43.0389, lng: -87.9065 },
  Minneapolis: { lat: 44.9778, lng: -93.265 },
  Moscow: { lat: 46.7324, lng: -117.0002 },
  Nampa: { lat: 43.5407, lng: -116.5635 },
  Nashville: { lat: 36.1627, lng: -86.7816 },
  "New Orleans": { lat: 29.9511, lng: -90.0715 },
  "New York": { lat: 40.7128, lng: -74.006 },
  "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
  Phoenix: { lat: 33.4484, lng: -112.074 },
  Pocatello: { lat: 42.8713, lng: -112.4455 },
  Portland: { lat: 45.5051, lng: -122.675 },
  "Post Falls": { lat: 47.718, lng: -116.9516 },
  Queens: { lat: 40.7282, lng: -73.7949 },
  "Salt Lake City": { lat: 40.7608, lng: -111.891 },
  "San Diego": { lat: 32.7157, lng: -117.1611 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Sandpoint: { lat: 48.2766, lng: -116.5535 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  Spokane: { lat: 47.6588, lng: -117.426 },
  "Spokane Valley": { lat: 47.6733, lng: -117.2394 },
  Tacoma: { lat: 47.2529, lng: -122.4443 },
  "Washington DC": { lat: 38.9072, lng: -77.0369 },
  "Spring City PA": { lat: 40.1804829, lng: -75.5506116 },
  "Forest Park GA": { lat: 33.62601, lng: -84.4012734 }
};

const extractCityNames = (coordinates: CityCoordinates) => {
  const cityNames: CityCoordinates = {};
  Object.keys(coordinates).map((key) => {
    const cityName = key.split(",")[0].trim();
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
    throw new Error(
      "Oops! It looks like you are trying to use city data outside of its provider. Please make sure your component is wrapped in a CityProvider."
    );
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
