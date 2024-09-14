import React, { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const normalizeTerm = (term: string) =>
    term.trim().replace(/\s+/g, "").toLowerCase();

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm) {
        // Normalize the search term (trim, remove spaces, and convert to lowercase)
        const normalizedSearchTerm = normalizeTerm(trimmedSearchTerm);

        // Define routing paths for normalized terms
        const pageRoutes: { [key: string]: string } = {
          home: "/",
          news: "/HHapi",
          comicbot: "/ComicBot",
          jokepad: "/JokePad",
          micfinder: "/MicFinder",
          profile: "/Profile",
          contact: "/contact",
          about: "/about",
        };

        // Check if the normalized search term matches a predefined page route
        if (pageRoutes[normalizedSearchTerm]) {
          router.push(pageRoutes[normalizedSearchTerm]);
        } else {
          // Handle the city search routing with normalized term
          onSearch(normalizedSearchTerm);
        }

        // Clear search input after submission
        setSearchTerm("");
      }
    },
    [onSearch, router, searchTerm]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleClearInput = useCallback(() => {
    setSearchTerm("");
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
          className="flex items-center rounded-lg bg-white shadow-lg z-10 animate-slide-in"
        >
          <input
            id="search-input"
            type="text"
            placeholder="Search city or page..."
            value={searchTerm}
            onChange={handleInputChange}
            className="p-2 text-black rounded-lg shadow-lg w-3/4"
            autoFocus
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchTerm && (
            <button
              type="button"
              className="px-2 py-2 text-black rounded-lg shadow-lg ml-2 bg-gray-300"
              onClick={handleClearInput}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-black rounded-lg shadow-lg ml-2 bg-gray-300"
          >
            Search
          </button>
        </form>
      )}
    </div>
  );
}
