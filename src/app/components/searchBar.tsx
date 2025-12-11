"use client";

import { useState, useMemo, useRef, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

interface SearchBarProps {
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

interface PageSuggestion {
  label: string;
  route: string;
  requiresAuth?: boolean;
}

type Suggestion = {
  type: "page" | "city";
  label: string;
  page?: PageSuggestion;
  city?: string;
};

const PAGES: PageSuggestion[] = [
  { label: "Mic Finder", route: "/MicFinder" },
  { label: "News", route: "/HHapi", requiresAuth: true },
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

const SearchIcon = memo(function SearchIcon() {
  return (
    <svg
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
  );
});

function SearchBar({ isUserSignedIn, setIsAuthModalOpen }: SearchBarProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch cities only when search opens (lazy load)
  useEffect(() => {
    if (!isInputVisible) return;
    if (cities.length > 0) return; // Already fetched

    let mounted = true;

    const fetchCities = async () => {
      try {
        const cached = sessionStorage.getItem("hh_cities");
        if (cached) {
          if (mounted) setCities(JSON.parse(cached));
          return;
        }

        const response = await fetch("/api/cities");
        if (response.ok) {
          const data = await response.json();
          if (mounted && data.cities) {
            setCities(data.cities);
            sessionStorage.setItem("hh_cities", JSON.stringify(data.cities));
          }
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    fetchCities();
    return () => {
      mounted = false;
    };
  }, [isInputVisible, cities.length]);

  const suggestions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized || normalized.length < 2) return [];

    const results: Suggestion[] = [];

    if (["login", "sign in", "sign up"].includes(normalized)) {
      results.push({ type: "page", label: "Login / Sign Up" });
    }

    if (KEYWORDS_TO_MICFINDER.has(normalized)) {
      results.push({ type: "page", label: "Mic Finder", page: PAGES[0] });
    }

    for (const page of PAGES) {
      if (page.label.toLowerCase().includes(normalized)) {
        results.push({ type: "page", label: page.label, page });
      }
    }

    let count = 0;
    for (const city of cities) {
      if (count >= 5) break;
      if (city.toLowerCase().includes(normalized)) {
        results.push({ type: "city", label: city, city });
        count++;
      }
    }

    return results;
  }, [searchTerm, cities]);

  const closeSearchBar = useCallback(() => {
    setSearchTerm("");
    setInputVisible(false);
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === "city" && suggestion.city) {
        router.push(`/MicFinder?city=${encodeURIComponent(suggestion.city)}`);
        closeSearchBar();
        return;
      }

      if (suggestion.label === "Login / Sign Up") {
        setIsAuthModalOpen(true);
        closeSearchBar();
        return;
      }

      if (suggestion.page) {
        const { route, requiresAuth, label } = suggestion.page;

        if (requiresAuth && !isUserSignedIn) {
          showToast(`Please sign in to access ${label}`, "info");
          setIsAuthModalOpen(true);
          closeSearchBar();
          return;
        }

        router.push(route);
        closeSearchBar();
      }
    },
    [router, closeSearchBar, setIsAuthModalOpen, isUserSignedIn, showToast],
  );

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
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

      // Check if it matches a city
      const matchingCity = cities.find((city) =>
        city.toLowerCase().includes(normalized),
      );
      if (matchingCity) {
        router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
        closeSearchBar();
        return;
      }

      if (suggestions.length === 0) {
        showToast("No results found. We've noted your search!", "info");
      }

      closeSearchBar();
    },
    [
      searchTerm,
      suggestions,
      cities,
      handleSelectSuggestion,
      router,
      closeSearchBar,
      showToast,
    ],
  );

  const handleToggleInput = useCallback(() => {
    setInputVisible((prev) => {
      if (!prev) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return !prev;
    });
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  return (
    <div className="relative" id="searchBar">
      {!isInputVisible && (
        <button
          onClick={handleToggleInput}
          className="flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-full p-1 transition-colors"
          aria-label="Toggle search"
        >
          <SearchIcon />
        </button>
      )}

      {isInputVisible && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 sm:left-full sm:translate-x-0 sm:ml-4 w-70 sm:w-80 z-50">
          <form
            onSubmit={handleSearch}
            className="flex flex-col items-center rounded-lg bg-zinc-200 shadow-2xl p-2 border border-zinc-400"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city, page, or keyword..."
              value={searchTerm}
              onChange={handleInputChange}
              className="p-2 text-zinc-950 rounded-lg bg-zinc-100 w-full border-2 border-transparent focus:border-amber-300 transition-colors placeholder:text-zinc-500"
              autoComplete="off"
            />

            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={closeSearchBar}
                className="flex-1 py-2 text-sm font-semibold text-zinc-900 rounded-lg bg-zinc-300 hover:bg-zinc-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-sm font-semibold text-zinc-100 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="w-full mt-2 max-h-60 overflow-y-auto divide-y divide-zinc-300 border-t border-zinc-300">
                {suggestions.map((sug, idx) => (
                  <li
                    key={`${sug.type}-${sug.label}-${idx}`}
                    className="p-2 hover:bg-zinc-300 text-zinc-900 text-sm flex justify-between items-center transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(sug);
                    }}
                  >
                    <span className="font-medium">{sug.label}</span>
                    <span className="text-xs text-zinc-600 uppercase tracking-wider font-bold">
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

export default memo(SearchBar);
