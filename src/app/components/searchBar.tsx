import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../../firebase.config"; // Adjust path to your config

// Props for the SearchBar
export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsComicBotModalOpen?: (open: boolean) => void;
}

// City shape from Firestore
interface City {
  id: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Extended page interface to store route & auth requirement
interface PageSuggestion {
  label: string;
  route?: string; // If page can be navigated via router.push
  requiresAuth?: boolean;
}

// For combining city and page suggestions
type Suggestion = {
  type: "page" | "city";
  label: string;
  page?: PageSuggestion;
  cityData?: City;
};

export default function SearchBar({
  onSearch,
  isUserSignedIn,
  setIsAuthModalOpen,
  setIsComicBotModalOpen,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const router = useRouter();

  // Pages & routing references
  const PAGES: PageSuggestion[] = [
    { label: "Mic Finder", route: "/MicFinder" },
    { label: "News", route: "/HHapi" },
    { label: "Comic Bot", requiresAuth: true }, // We'll open modal if not signed in
    { label: "Joke Pad", route: "/JokePad", requiresAuth: true },
    { label: "Contact", route: "/contact" },
    { label: "About", route: "/about" },
    { label: "Profile", route: "/Profile", requiresAuth: true },
  ];

  // Special keywords that always route to /MicFinder
  const KEYWORDS_TO_MICFINDER = [
    "festivals",
    "open mics",
    "mics",
    "competitions",
  ];

  // Utility to standardize the search term
  function normalizeTerm(term: string): string {
    return term.trim().toLowerCase();
  }

  // 1. Get city suggestions from Firestore
  async function fetchCities(queryTerm: string): Promise<Suggestion[]> {
    try {
      const citiesRef = collection(db, "cities");
      const snapshot = await getDocs(citiesRef);

      return snapshot.docs
        .map((doc) => {
          const data = doc.data() as DocumentData;
          const cityName = (data.city || "Unknown City").trim();
          return {
            type: "city" as const,
            label: cityName,
            cityData: {
              id: doc.id,
              city: cityName,
              coordinates: {
                lat: data.coordinates?.lat || 0,
                lng: data.coordinates?.lng || 0,
              },
            },
          };
        })
        .filter((c) => c.label.toLowerCase().includes(queryTerm));
    } catch (error) {
      // If you don’t want any error logs, just comment this out or handle differently
      // console.error("Error fetching cities:", error);
      return [];
    }
  }

  // 2. Filter pages by user input
  function filterPages(queryTerm: string): Suggestion[] {
    return PAGES.filter((p) => p.label.toLowerCase().includes(queryTerm)).map(
      (p) => ({
        type: "page",
        label: p.label,
        page: p,
      }),
    );
  }

  // 3. Load combined suggestions (cities + pages)
  async function loadSuggestions(term: string) {
    const normalized = normalizeTerm(term);
    if (!normalized) {
      setSuggestions([]);
      return;
    }

    // If keyword is in KEYWORDS_TO_MICFINDER, show that first
    const isMicKeyword = KEYWORDS_TO_MICFINDER.includes(normalized);

    // If user typed "login" or something similar, we might show a direct "Login" suggestion
    const isLogin = ["login", "sign in", "sign up"].includes(normalized);

    // Fetch in parallel
    const [citySuggestions, pageSuggestions] = await Promise.all([
      fetchCities(normalized),
      Promise.resolve(filterPages(normalized)),
    ]);

    let combined: Suggestion[] = [...citySuggestions, ...pageSuggestions];

    // Show a login suggestion if user typed "login"
    if (isLogin) {
      combined.unshift({
        type: "page",
        label: "Login",
      });
    }

    // If "festivals" etc. is typed, optionally push a top suggestion for that
    if (isMicKeyword) {
      combined.unshift({
        type: "page",
        label: "Mic Finder",
        page: { label: "Mic Finder", route: "/MicFinder" },
      });
    }

    setSuggestions(combined);
  }

  // 4. Handle user input changes
  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      await loadSuggestions(term);
    } else {
      setSuggestions([]);
    }
  }

  // 5. Handle picking a suggestion from the list
  function handleSelectSuggestion(suggestion: Suggestion) {
    if (suggestion.type === "city" && suggestion.cityData) {
      // City -> route
      router.push(
        `/MicFinder?city=${encodeURIComponent(suggestion.cityData.city)}`,
      );
      onSearch(suggestion.cityData.city);
    } else if (suggestion.type === "page" && suggestion.page) {
      const { route, requiresAuth, label } = suggestion.page;

      // Always show ComicBot modal
      if (label === "Comic Bot") {
        setIsComicBotModalOpen?.(true);
      }
      // If some other page requires auth but user not signed in
      else if (requiresAuth && !isUserSignedIn) {
        setIsAuthModalOpen(true);
      }
      // If we have a route, do normal routing
      else if (route) {
        router.push(route);
      }

      onSearch(label);
    }

    setSearchTerm("");
    setSuggestions([]);
  }

  // 6. Handle the normal form submission (Enter key)
  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeTerm(searchTerm);
    if (!normalized) return;

    // 1. Check if it's a known "MicFinder" keyword
    if (KEYWORDS_TO_MICFINDER.includes(normalized)) {
      router.push("/MicFinder");
      onSearch(searchTerm);
      setSearchTerm("");
      setSuggestions([]);
      return;
    }

    // 2. Check if the user typed "login"
    if (["login", "sign in", "sign up"].includes(normalized)) {
      setIsAuthModalOpen(true);
      setSearchTerm("");
      setSuggestions([]);
      return;
    }

    // 3. Check if there's an exact page match
    const matchedPage = PAGES.find((p) => p.label.toLowerCase() === normalized);
    if (matchedPage) {
      if (matchedPage.requiresAuth && !isUserSignedIn) {
        if (matchedPage.label === "Comic Bot" && setIsComicBotModalOpen) {
          setIsComicBotModalOpen(true);
        } else {
          setIsAuthModalOpen(true);
        }
      } else if (matchedPage.route) {
        router.push(matchedPage.route);
      }
      onSearch(matchedPage.label);
      setSearchTerm("");
      setSuggestions([]);
      return;
    }

    // 4. Check if it matches a city
    const cityList = await fetchCities(normalized);
    if (cityList.length > 0 && cityList[0].cityData) {
      router.push(
        `/MicFinder?city=${encodeURIComponent(cityList[0].cityData.city)}`,
      );
      onSearch(cityList[0].cityData.city);
      setSearchTerm("");
      setSuggestions([]);
      return;
    }

    // 5. Fallback: Just do onSearch
    onSearch(searchTerm);
    setSearchTerm("");
    setSuggestions([]);
  }

  // 7. Clear the search input
  function handleClearInput() {
    setSearchTerm("");
    setSuggestions([]);
    setIsFocused(true);
  }

  // 8. Toggle search bar visibility
  function handleToggleInput() {
    setInputVisible((prev) => !prev);
    setIsFocused(true);
  }

  // Focus the input when visible & isFocused
  useEffect(() => {
    if (isFocused && isInputVisible) {
      const searchInput = document.getElementById(
        "search-input",
      ) as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isFocused, isInputVisible]);

  return (
    <div className="relative" id="searchBar">
      {!isInputVisible && (
        <button
          onClick={handleToggleInput}
          className="flex items-center justify-center p-1 bg-zinc-100 text-zinc-900 rounded-full"
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
        <form
          onSubmit={handleSearch}
          className="flex flex-col items-center rounded-lg bg-white shadow-lg z-10 animate-slide-in"
        >
          <input
            id="search-input"
            type="text"
            placeholder="Search city, page, or keyword..."
            value={searchTerm}
            onChange={handleInputChange}
            className="p-2 text-black rounded-lg shadow-lg w-full"
            autoComplete="off"
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

          {/* Suggestions: pages + cities + special */}
          {suggestions.length > 0 && (
            <ul className="bg-white w-full shadow-lg rounded-lg mt-2 max-h-60 overflow-y-auto">
              {suggestions.map((sug, idx) => (
                <li
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-zinc-200 text-zinc-950"
                  onMouseDown={() => handleSelectSuggestion(sug)}
                >
                  {sug.label}
                  {sug.type === "city" ? " (city)" : " (page)"}
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}
