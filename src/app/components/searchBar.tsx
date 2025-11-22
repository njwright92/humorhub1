"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

// --- Types ---

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsComicBotModalOpen?: (open: boolean) => void;
  cities: string[]; // Received from parent (Header)
}

interface City {
  id: string;
  city: string;
}

interface PageSuggestion {
  label: string;
  route?: string;
  requiresAuth?: boolean;
}

type Suggestion = {
  type: "page" | "city";
  label: string;
  page?: PageSuggestion;
  cityData?: City;
};

// --- Static Data ---

const PAGES: PageSuggestion[] = [
  { label: "Mic Finder", route: "/MicFinder" },
  { label: "News", route: "/HHapi" },
  { label: "Comic Bot", requiresAuth: true },
  { label: "Joke Pad", route: "/JokePad", requiresAuth: true },
  { label: "Contact", route: "/contact" },
  { label: "About", route: "/about" },
  { label: "Profile", route: "/Profile", requiresAuth: true },
];

const KEYWORDS_TO_MICFINDER = new Set([
  "festivals",
  "open mics",
  "mics",
  "competitions",
]);

// --- Main Component ---

export default function SearchBar({
  onSearch,
  isUserSignedIn,
  setIsAuthModalOpen,
  setIsComicBotModalOpen,
  cities, // Data passed down from Header
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Memoized Suggestions (Uses the passed 'cities' prop directly)
  const suggestions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return [];

    const results: Suggestion[] = [];

    // Keywords
    if (["login", "sign in", "sign up"].includes(normalized)) {
      results.push({ type: "page", label: "Login / Sign Up" });
    }
    if (KEYWORDS_TO_MICFINDER.has(normalized)) {
      results.push({
        type: "page",
        label: "Mic Finder",
        page: { label: "Mic Finder", route: "/MicFinder" },
      });
    }

    // Pages
    for (const page of PAGES) {
      if (page.label.toLowerCase().includes(normalized)) {
        results.push({ type: "page", label: page.label, page });
      }
    }

    // Cities (Limit 5)
    let count = 0;
    for (const cityName of cities) {
      if (count >= 5) break;
      if (cityName.toLowerCase().includes(normalized)) {
        results.push({
          type: "city",
          label: cityName,
          // Construct object to match expected type structure
          cityData: { id: cityName, city: cityName },
        });
        count++;
      }
    }

    return results;
  }, [searchTerm, cities]);

  // 2. Actions
  const closeSearchBar = () => {
    setSearchTerm("");
    setInputVisible(false);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === "city" && suggestion.cityData) {
      router.push(
        `/MicFinder?city=${encodeURIComponent(suggestion.cityData.city)}`,
      );
      onSearch(suggestion.cityData.city);
    } else if (suggestion.label === "Login / Sign Up") {
      setIsAuthModalOpen(true);
    } else if (suggestion.type === "page" && suggestion.page) {
      const { route, requiresAuth, label } = suggestion.page;

      if (label === "Comic Bot") {
        setIsComicBotModalOpen?.(true);
      } else if (requiresAuth && !isUserSignedIn) {
        setIsAuthModalOpen(true);
      } else if (route) {
        router.push(route);
      }
      onSearch(label);
    }
    closeSearchBar();
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return;

    const exactMatch = suggestions.find(
      (s) => s.label.toLowerCase() === normalized,
    );
    if (exactMatch) {
      handleSelectSuggestion(exactMatch);
      return;
    }

    onSearch(searchTerm);
    closeSearchBar();
  };

  const handleToggleInput = () => {
    setInputVisible(!isInputVisible);
    if (!isInputVisible) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="relative" id="searchBar">
      {!isInputVisible && (
        <button
          onClick={handleToggleInput}
          className="flex items-center justify-center p-1 bg-zinc-200 text-zinc-900 rounded-full transform transition-colors"
          aria-label="Toggle search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}

      {isInputVisible && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 sm:left-full sm:translate-x-0 sm:ml-4 w-72 sm:w-80 z-50">
          <form
            onSubmit={handleSearch}
            className="flex flex-col items-center rounded-lg bg-zinc-200 shadow-xl p-2 animate-fade-in-down border border-zinc-400"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city, page, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 text-zinc-950 rounded-lg bg-zinc-100 w-full outline-none border border-transparent focus:border-orange-500 transition-colors"
              autoComplete="off"
            />

            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                className="flex-1 px-2 py-2 text-sm font-semibold text-zinc-900 rounded-lg bg-zinc-200 hover:bg-zinc-300 transition-colors"
                onClick={closeSearchBar}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-2 py-2 text-sm font-semibold text-zinc-100 rounded-lg bg-zinc-900 hover:bg-zinc-700 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <ul className="w-full mt-2 max-h-60 overflow-y-auto divide-y divide-zinc-100">
                {suggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    className="p-2 cursor-pointer hover:bg-zinc-100 text-zinc-800 text-sm flex justify-between items-center"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(sug);
                    }}
                  >
                    <span>{sug.label}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">
                      {sug.type}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
