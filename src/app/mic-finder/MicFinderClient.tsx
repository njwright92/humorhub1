"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/ToastContext";
import type {
  Event,
  CityCoordinates,
  EventCategory,
  MicFinderFilterResult,
} from "../lib/types";
import { DEFAULT_US_CENTER, DEFAULT_ZOOM, CITY_ZOOM } from "../lib/constants";
import { getDistanceFromLatLonInKm, normalizeCityName } from "../lib/utils";
import EventCard from "./EventCard";
import { saveEvent } from "@/app/actions/events";
import { useSession } from "@/app/components/SessionContext";

// --- UTILITIES & HOOKS ---
const parseLocalDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateInputValue = (date: Date | null) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
// -------------------------

const GoogleMap = dynamic(() => import("@/app/components/GoogleMap"), {
  ssr: false,
  loading: () => (
    <span className="size-full items-center justify-center text-stone-300">
      Loading Map...
    </span>
  ),
});

const VirtualizedEventList = dynamic(() => import("./VirtualizedEventList"), {
  ssr: false,
});

interface MicFinderClientProps {
  initialCityCoordinates: CityCoordinates;
  initialCities: string[];
  initialFilters: MicFinderFilterResult;
  initialDate: string | null;
}

const inputClass =
  "flex h-full w-full items-center justify-center rounded-2xl border-2 border-stone-500 bg-zinc-200 p-2 px-3 text-center font-semibold text-stone-900 shadow-xl outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-700/50";
const sectionHeadingClass =
  "mb-4 w-full rounded-2xl border-b-4 pb-2 text-center text-xl sm:text-2xl";
const emptyStateClass = "py-4 text-center text-stone-400";

const TABS = [
  {
    id: "Mics",
    label: "Comedy Mics",
    activeClass: "bg-amber-700",
    activeTextClass: "text-stone-900",
    inactiveClass:
      "bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold tracking-wide",
  },
  {
    id: "Festivals",
    label: "Festivals",
    activeClass: "bg-purple-700",
    activeTextClass: "text-white",
    inactiveClass:
      "bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold tracking-wide",
  },
  {
    id: "Other",
    label: "Music/All Arts",
    activeClass: "bg-green-700",
    activeTextClass: "text-white",
    inactiveClass:
      "bg-green-100 text-green-800 hover:bg-green-200 font-bold tracking-wide",
  },
] as const;

type TabId = EventCategory;

const TAB_LABELS: Record<TabId, string> = {
  Mics: "Comedy Mics",
  Festivals: "Festivals/Competitions",
  Other: "Music/All-Arts Mics",
};

export default function MicFinderClient({
  initialCityCoordinates,
  initialCities,
  initialFilters,
  initialDate,
}: MicFinderClientProps) {
  const { showToast } = useToast();
  const { session, refreshSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [locale, setLocale] = useState("en-US");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    parseLocalDate(initialDate),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [mapState, setMapState] = useState({
    isMapVisible: false,
    hasMapInit: false,
  });
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>("Mics");

  // Refactor: Consolidated event state
  const [eventData, setEventData] =
    useState<MicFinderFilterResult>(initialFilters);

  useEffect(() => {
    setLocale(navigator.language || "en-US");
  }, []);

  // Refactor: Replaced Vanilla window objects with Next.js router APIs
  useEffect(() => {
    const city = searchParams.get("city");
    const term = searchParams.get("searchTerm");

    if (city) {
      const normalized = normalizeCityName(city);
      setSelectedCity(normalized);
      setSearchTerm(normalized);
    } else if (term) {
      setSearchTerm(term);
    }

    if (city || term) {
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation)
      return showToast("Geolocation not supported", "error");

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        let closestCity: string | null = null;
        let minDistance = Infinity;

        for (const [city, coords] of Object.entries(initialCityCoordinates)) {
          const dist = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            coords.lat,
            coords.lng,
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        }

        if (closestCity) {
          const normalized = normalizeCityName(closestCity);
          setSelectedCity(normalized);
          setSearchTerm(normalized);
        } else {
          showToast("No supported cities found nearby", "info");
        }
      },
      () => showToast("Location access denied", "error"),
    );
  }, [initialCityCoordinates, showToast]);

  const handleCitySelect = useCallback((city: string) => {
    setIsCityDropdownOpen(false);
    const normalized = normalizeCityName(city);
    setSelectedCity(normalized);
    setSearchTerm(normalized);
  }, []);

  const handleEventSave = useCallback(
    async (event: Event) => {
      try {
        const current =
          session.status === "ready" ? session : await refreshSession();
        if (!current.signedIn) {
          showToast("Please sign in to save events.", "info");
          return;
        }
        if (!event.id) throw new Error("Invalid state");

        const payload = JSON.parse(JSON.stringify(event)) as Record<
          string,
          unknown
        >;
        const result = await saveEvent(payload);
        if (!result.success) throw new Error(result.error || "Failed to save");

        showToast("Event saved successfully!", "success");
      } catch {
        showToast("Failed to save event. Please try again.", "error");
      }
    },
    [refreshSession, session, showToast],
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(parseLocalDate(e.target.value));
    },
    [],
  );

  const handleMapHover = useCallback(() => {
    setMapState((prev) =>
      prev.hasMapInit ? prev : { ...prev, hasMapInit: true },
    );
  }, []);

  const toggleMapVisibility = useCallback(() => {
    setMapState((prev) => ({
      hasMapInit: true,
      isMapVisible: !prev.isMapVisible,
    }));
  }, []);

  const { dayOfWeek, formattedDate } = useMemo(() => {
    if (!selectedDate) return { dayOfWeek: "", formattedDate: "" };
    return {
      dayOfWeek: selectedDate.toLocaleDateString(locale, { weekday: "long" }),
      formattedDate: selectedDate.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      }),
    };
  }, [selectedDate, locale]);

  const tabLabel = TAB_LABELS[selectedTab];

  const dropdownCities = useMemo(() => {
    if (!debouncedSearchTerm) return initialCities;
    const term = debouncedSearchTerm.toLowerCase();
    return initialCities.filter((c) => c.toLowerCase().startsWith(term));
  }, [initialCities, debouncedSearchTerm]);

  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const controller = new AbortController();
    const fetchFilters = async () => {
      try {
        const params = new URLSearchParams();
        params.set("tab", selectedTab);
        if (selectedCity) params.set("city", selectedCity);
        if (selectedDate)
          params.set("date", formatDateInputValue(selectedDate));

        const response = await fetch(
          `/api/mic-finder/filter?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) return;

        // Refactor: Single state update execution
        const data: MicFinderFilterResult = await response.json();
        setEventData(data);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("Filter fetch failed:", error);
      }
    };

    void fetchFilters();
    return () => controller.abort();
  }, [selectedCity, selectedDate, selectedTab]);

  const mapConfig = useMemo(() => {
    const cityCoords = selectedCity
      ? initialCityCoordinates[selectedCity]
      : null;
    return cityCoords
      ? { lat: cityCoords.lat, lng: cityCoords.lng, zoom: CITY_ZOOM }
      : {
          lat: DEFAULT_US_CENTER.lat,
          lng: DEFAULT_US_CENTER.lng,
          zoom: DEFAULT_ZOOM,
        };
  }, [selectedCity, initialCityCoordinates]);

  return (
    <>
      <div className="relative z-20 mt-2 grid justify-center gap-3 sm:flex sm:gap-4">
        <div className="relative w-80 sm:w-64">
          <input
            type="text"
            placeholder="Select or Search City..."
            value={searchTerm}
            onFocus={() => setIsCityDropdownOpen(true)}
            onBlur={() =>
              setTimeout(() => {
                setIsCityDropdownOpen(false);
                setSearchTerm(selectedCity);
              }, 200)
            }
            onMouseEnter={handleMapHover}
            onTouchStart={handleMapHover}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
            autoComplete="off"
          />

          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 max-h-48 w-full overflow-auto rounded-2xl border border-stone-300 bg-zinc-200 shadow-xl">
              <ul role="listbox" aria-label="Available cities">
                <li
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    fetchUserLocation();
                    setIsCityDropdownOpen(false);
                  }}
                  className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-100 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700"
                >
                  <span aria-hidden="true">📍</span> Use My Location
                </li>
                <li
                  role="option"
                  aria-selected={selectedCity === "All Cities"}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedCity("All Cities");
                    setSearchTerm("All Cities");
                    setIsCityDropdownOpen(false);
                  }}
                  className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-50 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700"
                >
                  <span aria-hidden="true">🌎</span> All Cities
                </li>

                {(searchTerm === "" ? initialCities : dropdownCities).map(
                  (city) => (
                    <li
                      key={city}
                      role="option"
                      aria-selected={selectedCity === city}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCitySelect(city);
                      }}
                      className="cursor-pointer border-b border-stone-400 px-4 py-2 text-center text-stone-900 last:border-0 hover:bg-amber-100"
                    >
                      {city}
                    </li>
                  ),
                )}

                {searchTerm !== "" && dropdownCities.length === 0 && (
                  <li className="px-4 py-2 text-center text-stone-500">
                    No cities found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="relative w-80 sm:w-48">
          <label htmlFor="event-date-picker" className="sr-only">
            Select Event Date
          </label>
          <input
            id="event-date-picker"
            type="date"
            value={formatDateInputValue(selectedDate)}
            onChange={handleDateChange}
            onMouseEnter={handleMapHover}
            onTouchStart={handleMapHover}
            onClick={(e) => {
              if ("showPicker" in e.currentTarget) {
                e.currentTarget.showPicker();
              }
            }}
            className={`${inputClass} cursor-pointer`}
          />
        </div>
      </div>

      <nav
        aria-label="Event type filter"
        role="tablist"
        className="my-6 grid auto-cols-auto grid-flow-col justify-center gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`rounded-2xl px-3 py-2 text-sm font-bold shadow-xl transition-transform sm:text-base ${
              selectedTab === tab.id
                ? `${tab.activeClass} ${tab.activeTextClass} ring-2 ring-zinc-200`
                : tab.inactiveClass
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section
        aria-labelledby="recurring-heading"
        className="card-shell my-6 w-full"
      >
        <h2
          id="recurring-heading"
          className={`${sectionHeadingClass} border-amber-700`}
        >
          {dayOfWeek} {tabLabel}
          {selectedCity && ` in ${selectedCity}`}
        </h2>

        {!selectedCity ? (
          <p className="py-4 text-center text-base sm:text-lg">
            Select a city to see weekly {tabLabel.toLowerCase()}.
          </p>
        ) : selectedCity === "All Cities" ? (
          <p className="animate-pulse py-6 text-center text-lg font-bold text-amber-700">
            👇 Scroll to the bottom to see all {tabLabel.toLowerCase()}!
          </p>
        ) : eventData.recurringEvents.length > 0 ? (
          <div role="list" className="grid gap-4">
            {eventData.recurringEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSave={handleEventSave}
              />
            ))}
          </div>
        ) : (
          <p className={emptyStateClass}>
            No weekly {tabLabel.toLowerCase()} in {selectedCity} on {dayOfWeek}
            s.
          </p>
        )}
      </section>

      <section
        aria-labelledby="onetime-heading"
        className="card-shell my-6 w-full"
      >
        <h2
          id="onetime-heading"
          className={`${sectionHeadingClass} border-purple-700`}
        >
          {formattedDate} {tabLabel}
          {selectedCity && ` in ${selectedCity}`}
        </h2>

        {!selectedCity ? (
          <p className="py-4 text-center text-base sm:text-lg">
            Select a city to see one-time events.
          </p>
        ) : selectedCity === "All Cities" ? (
          <p className="animate-pulse py-6 text-center text-lg font-bold text-purple-700">
            👇 Scroll to the bottom to see all {tabLabel.toLowerCase()}!
          </p>
        ) : eventData.oneTimeEvents.length > 0 ? (
          <div role="list" className="grid gap-4">
            {eventData.oneTimeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSave={handleEventSave}
              />
            ))}
          </div>
        ) : (
          <p className={emptyStateClass}>
            No one-time {tabLabel.toLowerCase()} in {selectedCity} on{" "}
            {formattedDate}.
          </p>
        )}
      </section>

      {/* Map */}
      <section
        aria-label="Event Map"
        className="card-base-2 relative mt-6 mb-6 h-96 w-full border-amber-700 bg-stone-800"
      >
        <button
          type="button"
          onClick={toggleMapVisibility}
          onMouseEnter={handleMapHover}
          onTouchStart={handleMapHover}
          onFocus={handleMapHover}
          className={`absolute z-10 rounded-2xl px-4 py-2 font-bold shadow-xl transition-transform hover:scale-105 ${
            !mapState.isMapVisible
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-base text-stone-900 sm:text-lg"
              : "bottom-4 left-4 bg-stone-900 text-sm"
          }`}
        >
          {mapState.isMapVisible ? "Hide Map" : "Show Map"}
        </button>

        {mapState.hasMapInit && (
          <div
            className={`size-full transition-opacity duration-100 ${
              mapState.isMapVisible
                ? "visible opacity-100"
                : "invisible opacity-0"
            }`}
            aria-hidden={!mapState.isMapVisible}
          >
            <GoogleMap
              lat={mapConfig.lat}
              lng={mapConfig.lng}
              zoom={mapConfig.zoom}
              events={eventData.baseEvents}
            />
          </div>
        )}
      </section>

      <section
        aria-labelledby="all-events-heading"
        className="card-shell relative z-10 my-6 grid w-full justify-items-center gap-4 p-2"
      >
        <h2
          id="all-events-heading"
          className={`${sectionHeadingClass} border-amber-700`}
        >
          All {tabLabel}
          {selectedCity && ` in ${selectedCity}`}
        </h2>

        {!selectedCity && selectedTab !== "Festivals" ? (
          <p className={emptyStateClass}>
            Select a city to see all {tabLabel.toLowerCase()}.
          </p>
        ) : eventData.allCityEvents.length === 0 ? (
          <p className={emptyStateClass}>
            No {tabLabel.toLowerCase()} found
            {selectedCity && selectedCity !== "All Cities"
              ? ` in ${selectedCity}`
              : ""}
            .
          </p>
        ) : (
          <VirtualizedEventList
            events={eventData.allCityEvents}
            onSave={handleEventSave}
            className="h-96 w-full overflow-auto rounded-2xl border border-stone-600 contain-strict sm:h-125 md:h-150"
            ariaLabel={`${eventData.allCityEvents.length} ${tabLabel.toLowerCase()}`}
          />
        )}
      </section>
    </>
  );
}
