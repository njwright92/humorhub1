"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

const INPUT_ID = "search-input";
const POPOVER_ID = "site-search-popover";
const LISTBOX_ID = "search-suggestions";

type PageItem = {
  label: string;
  route: string;
  requiresAuth?: boolean;
};

const PAGES: PageItem[] = [
  { label: "Mic Finder", route: "/mic-finder" },
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

type Page = (typeof PAGES)[number];
type Suggestion =
  | { type: "action"; label: string }
  | { type: "page"; label: string; page: Page }
  | { type: "city"; label: string; city: string };

export default function SearchBar({
  isUserSignedIn,
  setIsAuthModalOpen,
  onNavigate,
}: {
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  onNavigate?: () => void;
}) {
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
      if (!prev) setTimeout(() => inputRef.current?.focus(), 0);
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

    for (const city of cities) {
      if (results.filter((r) => r.type === "city").length >= 5) break;
      if (city.toLowerCase().includes(q)) {
        results.push({ type: "city", label: city, city });
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

      if (s.type === "city") {
        navigateTo(`/mic-finder?city=${encodeURIComponent(s.city)}`);
        return;
      }

      if (s.page.requiresAuth && !isUserSignedIn) {
        showToast(`Please sign in to access ${s.page.label}`, "info");
        setIsAuthModalOpen(true);
        closeSearchBar();
        return;
      }
      navigateTo(s.page.route);
    },
    [navigateTo, isUserSignedIn, setIsAuthModalOpen, showToast, closeSearchBar]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const q = searchTerm.trim().toLowerCase();
      const suggestion =
        suggestions[activeIndex] ??
        suggestions.find((s) => s.label.toLowerCase() === q) ??
        cities.find((c) => c.toLowerCase().includes(q));

      if (typeof suggestion === "string") {
        executeSuggestion({
          type: "city",
          label: suggestion,
          city: suggestion,
        });
      } else if (suggestion) {
        executeSuggestion(suggestion);
      } else {
        showToast("No results found.", "info");
        closeSearchBar();
      }
    },
    [
      activeIndex,
      suggestions,
      searchTerm,
      cities,
      executeSuggestion,
      showToast,
      closeSearchBar,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const len = suggestions.length;
      if (!len && e.key !== "Escape") return;

      const actions: Record<string, () => void> = {
        ArrowDown: () => setActiveIndex((i) => (i < len - 1 ? i + 1 : 0)),
        ArrowUp: () => setActiveIndex((i) => (i > 0 ? i - 1 : len - 1)),
        Enter: () =>
          activeIndex >= 0 && executeSuggestion(suggestions[activeIndex]),
        Escape: closeSearchBar,
      };

      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    },
    [suggestions, activeIndex, executeSuggestion, closeSearchBar]
  );

  useEffect(() => {
    if (!isInputVisible || cities.length) return;

    let mounted = true;

    (async () => {
      try {
        const cached = sessionStorage.getItem("hh_cities");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted && Array.isArray(parsed)) setCities(parsed);
          return;
        }

        const res = await fetch("/api/cities");
        if (!res.ok) return;

        const { cities: data } = (await res.json()) as { cities?: unknown };
        if (mounted && Array.isArray(data)) {
          const valid = data.filter((c): c is string => typeof c === "string");
          setCities(valid);
          sessionStorage.setItem("hh_cities", JSON.stringify(valid));
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isInputVisible, cities.length]);

  useEffect(() => {
    if (!isInputVisible) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!formRef.current?.contains(e.target as Node)) closeSearchBar();
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isInputVisible, closeSearchBar]);

  return (
    <search className="relative">
      <button
        type="button"
        onClick={handleToggleInput}
        className="cursor-pointer text-zinc-200 transition hover:scale-110 sm:text-stone-900 sm:hover:text-stone-700"
        aria-label="Open search"
        aria-expanded={isInputVisible}
        aria-controls={POPOVER_ID}
      >
        <svg
          className="size-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {isInputVisible && (
        <form
          ref={formRef}
          id={POPOVER_ID}
          role="search"
          onSubmit={handleSearch}
          className="absolute top-0 left-1/2 z-50 grid w-72 -translate-x-1/2 gap-3 rounded-2xl border border-stone-400 bg-zinc-200 p-4 shadow-lg sm:left-full sm:ml-4 sm:w-80 sm:translate-x-0"
        >
          <button
            type="button"
            onClick={closeSearchBar}
            className="absolute top-0 right-0 cursor-pointer p-1 text-stone-900 hover:scale-105"
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

          <label htmlFor={INPUT_ID} className="sr-only">
            Search city, page, or keyword
          </label>

          <input
            ref={inputRef}
            id={INPUT_ID}
            type="search"
            placeholder="Search city, page, or keyword..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border-2 border-stone-400 bg-white p-2 text-stone-900 placeholder:text-stone-400"
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls={suggestions.length > 0 ? LISTBOX_ID : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
          />

          <button
            type="submit"
            className="mb-2 w-32 cursor-pointer justify-self-center rounded-2xl bg-amber-700 py-1 font-semibold text-white shadow-lg transition hover:scale-110 hover:bg-amber-900"
          >
            Search
          </button>

          {suggestions.length > 0 && (
            <ul
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Search suggestions"
              className="grid max-h-60 divide-y divide-stone-300 overflow-y-auto border-t border-stone-300"
            >
              {suggestions.map((sug, idx) => (
                <li
                  key={`${sug.type}-${sug.label}`}
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`grid cursor-pointer grid-cols-[1fr_auto] items-center p-2 text-sm text-stone-900 transition-colors ${idx === activeIndex ? "bg-amber-100" : "hover:bg-stone-300"}`}
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
      )}
    </search>
  );
}
