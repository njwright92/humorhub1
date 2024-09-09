"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../../firebase.config";

// Define the type for City Coordinates
type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

// Create the CityContext with an initial value of null
const CityContext = createContext<CityCoordinates | null>(null);

// Custom hook to access city data from the CityContext
export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error(
      "Oops! It looks like you are trying to use city data outside of its provider. Please make sure your component is wrapped in a CityProvider."
    );
  }
  return context;
};

// CityProvider component
export const CityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cityCoordinates, setCityCoordinates] = useState<CityCoordinates>({});

  // Fetch cities from Firestore and update the state
  const fetchCities = useCallback(async () => {
    try {
      const db = getFirestore(app);
      const citiesSnapshot = await getDocs(collection(db, "cities"));
      const citiesData: CityCoordinates = {};

      citiesSnapshot.forEach((doc) => {
        const cityData = doc.data();
        if (cityData.city && cityData.coordinates) {
          citiesData[cityData.city] = {
            lat: cityData.coordinates.lat,
            lng: cityData.coordinates.lng,
          };
        }
      });

      setCityCoordinates(citiesData);
    } catch (error) {
      console.error("Error fetching city data:", error);
    }
  }, []);

  // Fetch cities only once on mount
  useEffect(() => {
    if (Object.keys(cityCoordinates).length === 0) {
      fetchCities();
    }
  }, [cityCoordinates, fetchCities]);

  return (
    <CityContext.Provider value={cityCoordinates}>
      {children}
    </CityContext.Provider>
  );
};
