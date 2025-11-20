"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../../firebase.config";

// --- Types ---

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsComicBotModalOpen?: (open: boolean) => void;
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
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);

  // Cache cities
  const [allCities, setAllCities] = useState<City[]>([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Data (Optimized: Runs once)
  useEffect(() => {
    let mounted = true;

    const loadCities = async () => {
      const cached =
        typeof window !== "undefined"
          ? sessionStorage.getItem("hh_cities_full")
          : null;
      if (cached) {
        if (mounted) {
          setAllCities(JSON.parse(cached));
          setCitiesLoaded(true);
        }
        return;
      }

      try {
        const citiesRef = collection(db, "cities");
        const snapshot = await getDocs(citiesRef);
        const cities: City[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            city: (data.city || "Unknown City").trim(),
          };
        });

        if (mounted) {
          setAllCities(cities);
          setCitiesLoaded(true);
          sessionStorage.setItem("hh_cities_full", JSON.stringify(cities));
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    };

    if (!citiesLoaded && isInputVisible) {
      loadCities();
    }

    return () => {
      mounted = false;
    };
  }, [citiesLoaded, isInputVisible]);

  // 2. Memoized Suggestions
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
    for (const c of allCities) {
      if (count >= 5) break;
      if (c.city.toLowerCase().includes(normalized)) {
        results.push({ type: "city", label: c.city, cityData: c });
        count++;
      }
    }

    return results;
  }, [searchTerm, allCities]);

  // 3. Actions
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
          className="flex items-center justify-center p-1 bg-zinc-100 text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors"
          aria-label="Toggle search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}

      {isInputVisible && (
        /* 
           CSS EXPLANATION FOR FIX:
           - left-1/2 -translate-x-1/2: Centered on Mobile
           - sm:left-full: On Desktop (sidebar), position 100% to the right of the icon
           - sm:ml-4: Add a gap so it's not touching the sidebar
           - sm:translate-x-0: Remove the mobile centering
        */
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 sm:left-full sm:translate-x-0 sm:ml-4 w-72 sm:w-80 z-50">
          <form
            onSubmit={handleSearch}
            className="flex flex-col items-center rounded-lg bg-white shadow-xl p-2 animate-fade-in-down border border-zinc-200"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city, page, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 text-black rounded-lg bg-zinc-50 w-full outline-none border border-transparent focus:border-orange-500 transition-colors"
              autoComplete="off"
            />

            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                className="flex-1 px-2 py-2 text-sm font-semibold text-zinc-700 rounded-lg bg-zinc-200 hover:bg-zinc-300 transition-colors"
                onClick={closeSearchBar}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-2 py-2 text-sm font-semibold text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
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
