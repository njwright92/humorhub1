"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

const SEARCH_ID = "site-search";
const LISTBOX_ID = "search-suggestions";

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
  type: "page" | "city" | "action";
  label: string;
  page?: PageSuggestion;
  city?: string;
};

const PAGES: PageSuggestion[] = [
  { label: "Mic Finder", route: "/MicFinder" },
  { label: "News", route: "/News", requiresAuth: true },
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "size-10"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export default function SearchBar({
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

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = searchTerm.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: Suggestion[] = [];

    if (q === "login" || q === "sign in" || q === "sign up") {
      results.push({ type: "action", label: "Login / Sign Up" });
    }

    if (KEYWORDS_TO_MICFINDER.has(q)) {
      results.push({ type: "page", label: "Mic Finder", page: PAGES[0] });
    }

    for (const page of PAGES) {
      if (page.label.toLowerCase().includes(q)) {
        results.push({ type: "page", label: page.label, page });
      }
    }

    let shown = 0;
    for (const city of cities) {
      if (shown === 5) break;
      if (city.toLowerCase().includes(q)) {
        results.push({ type: "city", label: city, city });
        shown++;
      }
    }

    return results;
  }, [searchTerm, cities]);

  const executeSuggestion = useCallback(
    (s: Suggestion) => {
      if (s.type === "action") {
        setIsAuthModalOpen(true);
        closeSearchBar();
        return;
      }

      if (s.type === "city" && s.city) {
        navigateTo(`/MicFinder?city=${s.city}`);
        return;
      }

      if (s.page) {
        if (s.page.requiresAuth && !isUserSignedIn) {
          showToast(`Please sign in to access ${s.page.label}`, "info");
          setIsAuthModalOpen(true);
          closeSearchBar();
          return;
        }
        navigateTo(s.page.route);
      }
    },
    [navigateTo, isUserSignedIn, setIsAuthModalOpen, showToast, closeSearchBar]
  );

  const resolveSuggestion = useCallback((): Suggestion | null => {
    if (activeIndex >= 0) return suggestions[activeIndex] ?? null;

    const q = searchTerm.trim().toLowerCase();
    if (!q) return null;

    const exact = suggestions.find((s) => s.label.toLowerCase() === q);
    if (exact) return exact;

    const city = cities.find((c) => c.toLowerCase().includes(q));
    return city ? { type: "city", label: city, city } : null;
  }, [activeIndex, suggestions, searchTerm, cities]);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const suggestion = resolveSuggestion();
      if (suggestion) {
        executeSuggestion(suggestion);
      } else {
        showToast("No results found.", "info");
        closeSearchBar();
      }
    },
    [resolveSuggestion, executeSuggestion, showToast, closeSearchBar]
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
            executeSuggestion(suggestions[activeIndex]);
          }
          break;
      }
    },
    [suggestions, activeIndex, executeSuggestion]
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

  return (
    <search className="relative">
      <button
        type="button"
        onClick={handleToggleInput}
        className="flex cursor-pointer text-zinc-200 hover:scale-110 sm:text-stone-900"
        aria-label="Open search"
        aria-expanded={isInputVisible}
        aria-controls={SEARCH_ID}
      >
        <SearchIcon />
      </button>

      {isInputVisible && (
        <div className="absolute top-0 left-1/2 z-50 w-72 -translate-x-1/2 shadow-lg sm:left-full sm:ml-4 sm:w-80 sm:translate-x-0">
          <form
            ref={formRef}
            id={SEARCH_ID}
            role="search"
            onSubmit={handleSearch}
            className="relative flex flex-col gap-3 rounded-2xl border border-stone-400 bg-zinc-200 p-4"
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
              className="w-full rounded-2xl border-2 border-stone-400 bg-white p-2 text-stone-900 placeholder:text-stone-400"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={LISTBOX_ID}
              aria-activedescendant={
                activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
              }
            />

            <button
              type="submit"
              className="mx-auto w-32 cursor-pointer rounded-2xl bg-amber-700 py-1 text-base font-semibold text-white shadow-lg transition hover:scale-110 hover:bg-amber-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={closeSearchBar}
              className="absolute top-0 right-0 cursor-pointer rounded-full p-1 text-stone-900 transition hover:scale-110"
              aria-label="Close search"
            >
              <svg
                className="size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>

            {suggestions.length > 0 && (
              <ul
                id={LISTBOX_ID}
                role="listbox"
                aria-label="Search suggestions"
                className="mt-4 max-h-60 w-full divide-y divide-stone-300 overflow-y-auto border-t border-stone-300"
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
                      executeSuggestion(sug);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="font-medium">{sug.label}</span>
                    <span className="text-xs font-bold tracking-wider text-stone-500">
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
