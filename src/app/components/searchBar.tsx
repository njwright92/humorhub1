import React, { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { collection, getDocs, DocumentData } from "firebase/firestore";

import { db } from "../../../firebase.config"; // Adjust path to your config

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

interface City {
  id: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedCities, setSuggestedCities] = useState<City[]>([]);
  const router = useRouter();

  const normalizeTerm = (term: string) => term.trim().toLowerCase();

  const fetchCities = async (queryTerm: string) => {
    try {
      const citiesRef = collection(db, "cities");
      const normalizedQueryTerm = queryTerm.toLowerCase();

      const querySnapshot = await getDocs(citiesRef);

      // Filter the snapshot data based on the normalized query term
      const cities: City[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            city: data.city || "Unknown City",
            coordinates: {
              lat: data.coordinates?.lat || 0,
              lng: data.coordinates?.lng || 0,
            },
          };
        })
        .filter((city) =>
          city.city.toLowerCase().includes(normalizedQueryTerm)
        );

      setSuggestedCities(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term.trim()) {
        fetchCities(normalizeTerm(term));
      } else {
        setSuggestedCities([]);
      }
    },
    []
  );

  const handleCitySelect = (city: City) => {
    onSearch(city.city); // Call onSearch with the selected city
    setSearchTerm("");
    setSuggestedCities([]);
    router.push(`/MicFinder?city=${encodeURIComponent(city.city)}`);
  };

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalizedSearchTerm = normalizeTerm(searchTerm);
      if (normalizedSearchTerm) {
        onSearch(normalizedSearchTerm);
      }
      setSearchTerm("");
    },
    [onSearch, searchTerm]
  );

  const handleClearInput = useCallback(() => {
    setSearchTerm("");
    setSuggestedCities([]);
    setIsFocused(true);
  }, []);

  const handleToggleInput = useCallback(() => {
    setInputVisible((prev) => !prev);
    setIsFocused(true);
  }, []);

  useEffect(() => {
    if (isFocused && isInputVisible) {
      document.getElementById("search-input")?.focus();
    }
  }, [isFocused, isInputVisible]);

  return (
    <div className="relative" id="searchBar">
      {!isInputVisible && (
        <button
          onClick={handleToggleInput}
          className="flex items-center justify-center p-2 bg-white text-black rounded-full z-10"
          aria-label="Toggle search"
        >
          <MagnifyingGlassIcon className="h-8 w-8" />
        </button>
      )}

      {isInputVisible && (
        <form
          onSubmit={handleSearch}
          className="flex flex-col items-center rounded-lg bg-white shadow-lg z-10 animate-slide-in"
        >
          <input
            id="search-input"
            type="text"
            placeholder="Search city or page..."
            value={searchTerm}
            onChange={handleInputChange}
            className="p-2 text-black rounded-lg shadow-lg w-full"
            autoFocus
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchTerm && (
            <button
              type="button"
              className="px-2 py-2 text-black rounded-xl shadow-lg bg-zinc-300 mt-2"
              onClick={handleClearInput}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-3 text-black rounded-xl shadow-lg bg-zinc-300 mt-2"
          >
            Search
          </button>

          {suggestedCities.length > 0 && (
            <ul className="bg-white w-full shadow-lg rounded-lg mt-2 max-h-60 overflow-y-auto">
              {suggestedCities.map((city) => (
                <li
                  key={city.id}
                  className="p-2 cursor-pointer hover:bg-zinc-200 text-zinc-950"
                  onClick={() => handleCitySelect(city)}
                >
                  {city.city}
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}
