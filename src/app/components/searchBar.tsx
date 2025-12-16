"use client";

import { useState, useMemo, useRef, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

interface SearchBarProps {
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  onNavigate?: () => void;
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
      className="size-10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
});

function SearchBar({
  isUserSignedIn,
  setIsAuthModalOpen,
  onNavigate,
}: SearchBarProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const closeSearchBar = useCallback(() => {
    setSearchTerm("");
    setInputVisible(false);
    setActiveIndex(-1);
  }, []);

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path);
      onNavigate?.();
      closeSearchBar();
    },
    [router, onNavigate, closeSearchBar]
  );

  const handleToggleInput = useCallback(() => {
    setInputVisible((prev) => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 50);
      return !prev;
    });
  }, []);

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

  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === "city" && suggestion.city) {
        navigateTo(`/MicFinder?city=${encodeURIComponent(suggestion.city)}`);
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

        navigateTo(route);
      }
    },
    [navigateTo, closeSearchBar, setIsAuthModalOpen, isUserSignedIn, showToast]
  );

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalized = searchTerm.trim().toLowerCase();
      if (!normalized) return;

      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex]);
        return;
      }

      const exactMatch = suggestions.find(
        (s) => s.label.toLowerCase() === normalized
      );
      if (exactMatch) {
        handleSelectSuggestion(exactMatch);
        return;
      }

      const matchingCity = cities.find((city) =>
        city.toLowerCase().includes(normalized)
      );
      if (matchingCity) {
        navigateTo(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
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
      activeIndex,
      handleSelectSuggestion,
      navigateTo,
      closeSearchBar,
      showToast,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          if (activeIndex >= 0) {
            e.preventDefault();
            handleSelectSuggestion(suggestions[activeIndex]);
          }
          break;
      }
    },
    [suggestions, activeIndex, handleSelectSuggestion]
  );

  useEffect(() => {
    if (!isInputVisible || cities.length > 0) return;

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

  useEffect(() => {
    if (!isInputVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearchBar();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        closeSearchBar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isInputVisible, closeSearchBar]);

  const searchId = "site-search";
  const listboxId = "search-suggestions";

  return (
    <search className="relative">
      {!isInputVisible ? (
        <button
          type="button"
          onClick={handleToggleInput}
          className="flex items-center justify-center rounded-full bg-zinc-200 p-1 text-stone-900 transition-colors hover:bg-white"
          aria-label="Open search"
          aria-expanded={isInputVisible}
          aria-controls={searchId}
        >
          <SearchIcon />
        </button>
      ) : (
        <div className="absolute top-0 left-1/2 z-50 w-72 -translate-x-1/2 sm:left-full sm:ml-4 sm:w-80 sm:translate-x-0">
          <form
            ref={formRef}
            id={searchId}
            role="search"
            onSubmit={handleSearch}
            className="flex flex-col rounded-2xl border border-stone-300 bg-zinc-200 p-2 shadow-lg"
          >
            <label htmlFor="search-input" className="sr-only">
              Search city, page, or keyword
            </label>
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              placeholder="Search city, page, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border-2 border-transparent bg-white p-2 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-700"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={
                activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
              }
            />

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={closeSearchBar}
                className="flex-1 rounded-2xl bg-stone-300 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-amber-700 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
              >
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Search suggestions"
                className="mt-2 max-h-60 w-full divide-y divide-stone-300 overflow-y-auto border-t border-stone-300"
              >
                {suggestions.map((sug, idx) => (
                  <li
                    key={`${sug.type}-${sug.label}-${idx}`}
                    id={`suggestion-${idx}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    className={`flex cursor-pointer items-center justify-between p-2 text-sm text-stone-900 transition-colors ${
                      idx === activeIndex
                        ? "bg-amber-100"
                        : "hover:bg-stone-300"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(sug);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="font-medium">{sug.label}</span>
                    <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                      {sug.type}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      )}
    </search>
  );
}

export default memo(SearchBar);
