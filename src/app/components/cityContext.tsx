"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import PropTypes from "prop-types";
import { app } from "../../../firebase.config";

const CityContext = createContext<any>(null);

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

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
export const CityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cityCoordinates, setCityCoordinates] = useState<CityCoordinates>({});

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const db = getFirestore(app);
        const citiesSnapshot = await getDocs(collection(db, "cities"));
        const citiesData: CityCoordinates = {};

        citiesSnapshot.forEach((doc) => {
          const cityData = doc.data();
          citiesData[cityData.city] = {
            lat: cityData.coordinates.lat,
            lng: cityData.coordinates.lng,
          };
        });

        setCityCoordinates(citiesData);
      } catch (error) {}
    };

    fetchCities();
  }, []);

  return (
    <CityContext.Provider value={cityCoordinates}>
      {children}
    </CityContext.Provider>
  );
};

CityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
