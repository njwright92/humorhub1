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
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import { useSession } from "./SessionContext";
import CloseIcon from "./CloseIcon";
import { CITIES_CACHE_KEY } from "../lib/constants";

const INPUT_ID = "search-input";
const POPOVER_ID = "site-search-popover";
const LISTBOX_ID = "search-suggestions";

type PageItem = { label: string; route: string; requiresAuth?: boolean };

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

const SuggestionList = memo(function SuggestionList({
  deferredSearchTerm,
  cities,
  activeIndex,
  onExecute,
  onHoverIndex,
  onSuggestionsChange,
  isModal = false,
}: {
  deferredSearchTerm: string;
  cities: string[];
  activeIndex: number;
  onExecute: (sug: Suggestion) => void;
  onHoverIndex: (idx: number) => void;
  onSuggestionsChange: (sugs: Suggestion[]) => void;
  isModal?: boolean;
}) {
  const suggestions = useMemo<Suggestion[]>(() => {
    const q = deferredSearchTerm.trim().toLowerCase();
    if (q.length < 2) return [];

    const r: Suggestion[] = [];

    if (["login", "sign in", "sign up"].includes(q))
      r.push({ type: "action", label: "Login / Sign Up" });

    if (KEYWORDS_TO_MICFINDER.has(q))
      r.push({ type: "page", label: "Mic Finder", page: PAGES[0] });

    for (const p of PAGES)
      if (p.label.toLowerCase().startsWith(q))
        r.push({ type: "page", label: p.label, page: p });

    let c = 0;
    for (const city of cities) {
      if (c >= 5) break;
      if (city.toLowerCase().startsWith(q)) {
        r.push({ type: "city", label: city, city });
        c++;
      }
    }
    return r;
  }, [deferredSearchTerm, cities]);

  useEffect(() => {
    onSuggestionsChange(suggestions);
  }, [suggestions, onSuggestionsChange]);

  if (!suggestions.length) return null;

  return (
    <ul
      id={LISTBOX_ID}
      role="listbox"
      className={`grid divide-y divide-stone-400 overflow-auto border-t border-stone-400 ${
        isModal ? "max-h-[calc(100dvh-11rem)]" : "max-h-60"
      }`}
    >
      {suggestions.map((sug, idx) => (
        <li
          key={`${sug.type}-${sug.label}`}
          className={`grid cursor-pointer grid-cols-[1fr_auto] items-center p-2 text-sm transition-colors ${
            idx === activeIndex ? "bg-amber-100" : "hover:bg-amber-300"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            onExecute(sug);
          }}
          onMouseEnter={() => onHoverIndex(idx)}
        >
          <span className="font-bold text-zinc-900 italic">{sug.label}</span>
          <span className="text-xs text-stone-600 uppercase">{sug.type}</span>
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
  canExpandSearch = true,
}: {
  isUserSignedIn: boolean;
  sessionStatus: "unknown" | "ready";
  onNavigate?: () => void;
  onRequireAuth?: (path: string, label: string) => void;
  canExpandSearch?: boolean;
}) {
  const { showToast } = useToast();
  const { setIsAuthModalOpen } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const deferredTerm = useDeferredValue(searchTerm);
  const isModal = !canExpandSearch;

  const close = useCallback(() => {
    setSearchTerm("");
    setIsOpen(false);
    setActiveIndex(-1);
    setSuggestions([]);
  }, []);

  const go = useCallback(
    (path: string) => {
      router.push(path);
      onNavigate?.();
      close();
    },
    [router, onNavigate, close],
  );

  const requireAuth = useCallback(
    (route: string, label: string) => {
      if (onRequireAuth) onRequireAuth(route, label);
      else setIsAuthModalOpen(true);
      close();
    },
    [onRequireAuth, setIsAuthModalOpen, close],
  );

  const exec = useCallback(
    (s: Suggestion) => {
      if (s.type === "action") {
        setIsAuthModalOpen(true);
        close();
        return;
      }
      if (s.type === "city") {
        go(`/mic-finder?city=${encodeURIComponent(s.city)}`);
        return;
      }

      if (s.page.requiresAuth && !isUserSignedIn) {
        if (sessionStatus === "ready")
          showToast(`Please sign in to access ${s.page.label}`, "info");
        requireAuth(s.page.route, s.page.label);
        return;
      }
      go(s.page.route);
    },
    [
      go,
      isUserSignedIn,
      sessionStatus,
      setIsAuthModalOpen,
      showToast,
      requireAuth,
      close,
    ],
  );

  const handleSearch = useCallback(
    (e: { preventDefault(): void }) => {
      e.preventDefault();
      const q = searchTerm.trim().toLowerCase();

      const match =
        suggestions[activeIndex] ??
        suggestions.find((s) => s.label.toLowerCase() === q);

      if (match) {
        exec(match);
        return;
      }

      const city = cities.find((c) => c.toLowerCase().startsWith(q));
      if (city) {
        exec({ type: "city", label: city, city });
        return;
      }

      showToast("No results found.", "info");
      close();
    },
    [activeIndex, suggestions, searchTerm, cities, exec, showToast, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const len = suggestions.length;
      if (!len && e.key !== "Escape") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < len - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : len - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        exec(suggestions[activeIndex]);
      } else if (e.key === "Escape") close();
    },
    [suggestions, activeIndex, exec, close],
  );

  useEffect(() => {
    if (!isOpen || cities.length) return;
    let mounted = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem(CITIES_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted && Array.isArray(parsed) && parsed.length) {
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
          if (valid.length)
            sessionStorage.setItem(CITIES_CACHE_KEY, JSON.stringify(valid));
        }
      } catch {
        // Swallow fetch errors to avoid leaking internals
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen, cities.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!formRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || canExpandSearch) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, canExpandSearch]);

  const suggestionList = (
    <SuggestionList
      deferredSearchTerm={deferredTerm}
      cities={cities}
      activeIndex={activeIndex}
      onExecute={exec}
      onHoverIndex={setActiveIndex}
      onSuggestionsChange={setSuggestions}
      isModal={isModal}
    />
  );

  const searchInput = (
    <>
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
        className={`input-amber bg-white placeholder:text-stone-400 focus:outline-hidden ${
          isModal ? "p-3 text-base" : "mt-2 p-2"
        }`}
        autoComplete="off"
        role="combobox"
      />
      <button
        type="submit"
        className={`btn-primary text-sm ${isModal ? "w-full py-2" : "w-32 justify-self-center py-1"}`}
      >
        Search
      </button>
      {suggestionList}
    </>
  );

  return (
    <search className="relative z-50">
      <button
        type="button"
        onClick={() => {
          setIsOpen((p) => {
            if (!p) setTimeout(() => inputRef.current?.focus(), 0);
            return !p;
          });
        }}
        className="text-zinc-200 transition-transform hover:scale-110 hover:text-stone-700"
        aria-label="Open search"
        aria-expanded={isOpen}
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

      {isOpen && canExpandSearch && (
        <form
          ref={formRef}
          id={POPOVER_ID}
          role="search"
          onSubmit={handleSearch}
          className="panel-light absolute top-12 z-50 w-80 -translate-x-3/4 sm:left-full sm:ml-4 sm:translate-x-0 md:top-0"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-0 right-0 p-1 transition-transform hover:scale-105"
            aria-label="Close search"
          >
            <CloseIcon className="light-close size-5" />
          </button>
          {searchInput}
        </form>
      )}

      {isOpen &&
        isModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-zinc-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-search-title"
          >
            <form
              ref={formRef}
              id={POPOVER_ID}
              role="search"
              onSubmit={handleSearch}
              className="grid h-full content-start gap-3 p-3 pt-4"
            >
              <div className="flex items-center border-b border-stone-400 pb-3">
                <button
                  type="button"
                  onClick={close}
                  className="shrink-0 rounded-full p-2 text-stone-900 transition-colors hover:bg-zinc-200"
                  aria-label="close search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h1
                  id="mobile-search-title"
                  className="flex-1 text-center text-2xl text-stone-900 italic"
                >
                  Humor Hub
                </h1>
                <div className="size-9 shrink-0" aria-hidden="true" />
              </div>
              {searchInput}
            </form>
          </div>,
          document.body,
        )}
    </search>
  );
}
