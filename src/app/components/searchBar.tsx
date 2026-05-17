"use client";

import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  memo,
  useDeferredValue,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import { useSession } from "./SessionContext";
import CloseIcon from "./CloseIcon";
import { CITIES_CACHE_KEY } from "../lib/constants";

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

type Suggestion =
  | { type: "action"; label: string }
  | { type: "page"; label: string; page: PageItem }
  | { type: "city"; label: string; city: string };

// 1. ISOLATED LIST COMPONENT: Prevents array looping mechanics from breaking text input frames
interface SuggestionListProps {
  deferredSearchTerm: string;
  cities: string[];
  activeIndex: number;
  onExecute: (sug: Suggestion) => void;
  onHoverIndex: (idx: number) => void;
  onSuggestionsChange: (sugs: Suggestion[]) => void;
}

const SuggestionList = memo(function SuggestionList({
  deferredSearchTerm,
  cities,
  activeIndex,
  onExecute,
  onHoverIndex,
  onSuggestionsChange,
}: SuggestionListProps) {
  // Computes matches off the deferred state loop safely
  const currentSuggestions = useMemo<Suggestion[]>(() => {
    const q = deferredSearchTerm.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: Suggestion[] = [];

    if (["login", "sign in", "sign up"].includes(q)) {
      results.push({ type: "action", label: "Login / Sign Up" });
    }

    if (KEYWORDS_TO_MICFINDER.has(q)) {
      results.push({ type: "page", label: "Mic Finder", page: PAGES[0] });
    }

    for (const page of PAGES) {
      if (page.label.toLowerCase().startsWith(q)) {
        results.push({ type: "page", label: page.label, page });
      }
    }

    let cityCount = 0;
    for (const city of cities) {
      if (cityCount >= 5) break;
      if (city.toLowerCase().startsWith(q)) {
        results.push({ type: "city", label: city, city });
        cityCount++;
      }
    }

    return results;
  }, [deferredSearchTerm, cities]);

  // Bubble up raw suggestions back to parent references safely without structural recursion loops
  useEffect(() => {
    onSuggestionsChange(currentSuggestions);
  }, [currentSuggestions, onSuggestionsChange]);

  if (currentSuggestions.length === 0) return null;

  return (
    <ul
      id={LISTBOX_ID}
      role="listbox"
      className="grid max-h-60 divide-y divide-stone-300 overflow-auto border-t border-stone-400"
    >
      {currentSuggestions.map((sug, idx) => (
        <li
          key={`${sug.type}-${sug.label}`}
          className={`grid cursor-pointer grid-cols-[1fr_auto] items-center p-2 text-sm transition-colors ${
            idx === activeIndex ? "bg-amber-100" : "hover:bg-stone-300"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            onExecute(sug);
          }}
          onMouseEnter={() => onHoverIndex(idx)}
        >
          <span className="font-medium">{sug.label}</span>
          <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
            {sug.type}
          </span>
        </li>
      ))}
    </ul>
  );
});

export default function SearchBar({
  isUserSignedIn,
  sessionStatus,
  onNavigate,
  onRequireAuth,
}: {
  isUserSignedIn: boolean;
  sessionStatus: "unknown" | "ready";
  onNavigate?: () => void;
  onRequireAuth?: (path: string, label: string) => void;
}) {
  const { showToast } = useToast();
  const { setIsAuthModalOpen } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSuggestions, setActiveSuggestions] = useState<Suggestion[]>([]);

  // Defer search tracking to prioritize frame rendering transitions
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const closeSearchBar = useCallback(() => {
    setSearchTerm("");
    setInputVisible(false);
    setActiveIndex(-1);
    setActiveSuggestions([]);
  }, []);

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path);
      onNavigate?.();
      closeSearchBar();
    },
    [router, onNavigate, closeSearchBar],
  );

  const handleToggleInput = useCallback(() => {
    setInputVisible((prev) => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 0);
      return !prev;
    });
  }, []);

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

      if (s.type === "page") {
        if (s.page.requiresAuth && !isUserSignedIn) {
          if (sessionStatus !== "ready") {
            if (onRequireAuth) {
              onRequireAuth(s.page.route, s.page.label);
            } else {
              setIsAuthModalOpen(true);
            }
            closeSearchBar();
            return;
          }

          showToast(`Please sign in to access ${s.page.label}`, "info");
          if (onRequireAuth) {
            onRequireAuth(s.page.route, s.page.label);
          } else {
            setIsAuthModalOpen(true);
          }
          closeSearchBar();
          return;
        }
        navigateTo(s.page.route);
      }
    },
    [
      navigateTo,
      isUserSignedIn,
      sessionStatus,
      onRequireAuth,
      setIsAuthModalOpen,
      showToast,
      closeSearchBar,
    ],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const q = searchTerm.trim().toLowerCase();

      const suggestion =
        activeSuggestions[activeIndex] ??
        activeSuggestions.find((s) => s.label.toLowerCase() === q);

      if (suggestion) {
        executeSuggestion(suggestion);
        return;
      }

      const matchedCity = cities.find((c) => c.toLowerCase().startsWith(q));
      if (matchedCity) {
        executeSuggestion({
          type: "city",
          label: matchedCity,
          city: matchedCity,
        });
        return;
      }

      showToast("No results found.", "info");
      closeSearchBar();
    },
    [
      activeIndex,
      activeSuggestions,
      searchTerm,
      cities,
      executeSuggestion,
      showToast,
      closeSearchBar,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const len = activeSuggestions.length;
      if (!len && e.key !== "Escape") return;

      const actions: Record<string, () => void> = {
        ArrowDown: () => setActiveIndex((i) => (i < len - 1 ? i + 1 : 0)),
        ArrowUp: () => setActiveIndex((i) => (i > 0 ? i - 1 : len - 1)),
        Enter: () => {
          if (activeIndex >= 0) {
            e.preventDefault();
            executeSuggestion(activeSuggestions[activeIndex]);
          }
        },
        Escape: closeSearchBar,
      };

      if (actions[e.key]) {
        if (e.key !== "Enter") e.preventDefault();
        actions[e.key]();
      }
    },
    [activeSuggestions, activeIndex, executeSuggestion, closeSearchBar],
  );

  const handleHoverIndex = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  const handleSuggestionsChange = useCallback((sugs: Suggestion[]) => {
    setActiveSuggestions(sugs);
  }, []); // No dependencies needed

  useEffect(() => {
    if (!isInputVisible || cities.length) return;

    let mounted = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem(CITIES_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted && Array.isArray(parsed) && parsed.length > 0) {
            setCities(parsed);
            return;
          }
        }

        const res = await fetch("/api/cities");
        if (!res.ok) return;

        const { cities: data } = (await res.json()) as { cities?: unknown };
        if (mounted && Array.isArray(data)) {
          const valid = data.filter((c): c is string => typeof c === "string");
          setCities(valid);
          if (valid.length > 0) {
            sessionStorage.setItem(CITIES_CACHE_KEY, JSON.stringify(valid));
          }
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
  }, [isInputVisible, closeSearchBar]); // Essential dependencies for proper cleanup

  return (
    <search className="relative">
      <button
        type="button"
        onClick={handleToggleInput}
        className="xs-text-zinc-200 transition-transform hover:scale-110 hover:text-stone-700 md:text-stone-900"
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
          className="panel-light absolute top-10 z-50 w-72 -translate-x-3/4 sm:left-full sm:ml-4 sm:w-80 sm:translate-x-0"
        >
          <button
            type="button"
            onClick={closeSearchBar}
            className="absolute top-0 right-0 p-1 transition-transform hover:scale-105"
            aria-label="Close search"
          >
            <CloseIcon className="size-5" />
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
            className="input-amber mt-2 bg-white p-2 placeholder:text-stone-400 focus:outline-hidden"
            autoComplete="off"
            role="combobox"
          />

          <button
            type="submit"
            className="btn-primary w-32 justify-self-center py-1 text-sm"
          >
            Search
          </button>

          <SuggestionList
            deferredSearchTerm={deferredSearchTerm}
            cities={cities}
            activeIndex={activeIndex}
            onExecute={executeSuggestion}
            onHoverIndex={handleHoverIndex}
            onSuggestionsChange={handleSuggestionsChange}
          />
        </form>
      )}
    </search>
  );
}
