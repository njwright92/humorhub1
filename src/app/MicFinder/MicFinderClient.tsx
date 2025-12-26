"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import dynamic from "next/dynamic";
import type { Auth } from "firebase/auth";
import { useToast } from "@/app/components/ToastContext";
import type { Event, CityCoordinates } from "../lib/types";
import {
  DAY_MAP,
  DEFAULT_US_CENTER,
  DEFAULT_ZOOM,
  CITY_ZOOM,
} from "../lib/constants";
import { getDistanceFromLatLonInKm, normalizeCityName } from "../lib/utils";

const EventForm = dynamic(() => import("../components/EventForm"));
const GoogleMap = dynamic(() => import("@/app/components/GoogleMap"), {
  loading: () => (
    <span className="flex size-full items-center justify-center text-stone-300">
      Loading Map...
    </span>
  ),
});

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

interface MicFinderClientProps {
  initialEvents: Event[];
  initialCityCoordinates: CityCoordinates;
  initialCities: string[];
}

// Shared styles
const dropdownBtnClass =
  "flex h-full w-full items-center justify-center rounded-2xl border-2 border-stone-500 bg-zinc-200 p-2 px-3 text-center font-semibold text-stone-900 shadow-lg outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/50";

const dropdownContainerClass =
  "absolute top-full left-0 z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-stone-300 bg-zinc-200 shadow-lg";

const dropdownInputClass =
  "w-full border-b-2 bg-zinc-200 px-3 py-2 text-stone-900 outline-none";

const saveButtonClass =
  "mt-2 mb-2 self-center rounded-2xl bg-amber-700 px-3 py-1.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 sm:px-2 sm:py-1 sm:text-lg";

// Tab configuration
const TABS = [
  {
    id: "Mics",
    label: "Comedy Mics",
    activeClass: "bg-amber-700",
    inactiveClass:
      "bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold tracking-wide",
  },
  {
    id: "Festivals",
    label: "Festivals",
    activeClass: "bg-purple-700",
    inactiveClass:
      "bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold tracking-wide",
  },
  {
    id: "Other",
    label: "Music/All Arts",
    activeClass: "bg-green-700",
    inactiveClass:
      "bg-green-100 text-green-800 hover:bg-green-200 font-bold tracking-wide",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EventCard = memo(function EventCard({
  event,
  onSave,
}: {
  event: Event;
  onSave: (event: Event) => void;
}) {
  return (
    <article className="mb-4 flex flex-col items-center rounded-2xl border border-stone-600 p-2 text-center shadow-lg">
      <h3 className="text-lg font-bold text-amber-600 md:text-xl">
        {event.name}
      </h3>

      <div className="my-2 flex flex-col gap-1">
        <p className="text-sm">
          <span aria-hidden="true">📅 </span>
          <span className="sr-only">Date: </span>
          {event.date}
        </p>
        <p className="text-sm">
          <span aria-hidden="true">📍 </span>
          <span className="sr-only">Location: </span>
          {event.location}
        </p>
      </div>

      <div className="mt-2 w-full px-2 text-sm">
        <span className="mb-1 block font-bold">
          <span aria-hidden="true">ℹ️ </span>
          Details:
        </span>
        <div
          className="wrap-break-word [&_a]:text-blue-400"
          dangerouslySetInnerHTML={{ __html: event.details }}
        />
      </div>

      <button
        type="button"
        onClick={() => onSave(event)}
        className={saveButtonClass}
        aria-label={`Save ${event.name}`}
      >
        Save Event
      </button>
    </article>
  );
});

export default function MicFinderClient({
  initialEvents,
  initialCityCoordinates,
  initialCities,
}: MicFinderClientProps) {
  const { showToast } = useToast();

  // State
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("All Cities");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [hasMapInit, setHasMapInit] = useState(false);
  const [isFirstDropdownOpen, setIsFirstDropdownOpen] = useState(false);
  const [isSecondDropdownOpen, setIsSecondDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>("Mics");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Refs
  const authRef = useRef<Auth | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Analytics helper
  const sendDataLayerEvent = useCallback(
    (event_name: string, params: Record<string, unknown>) => {
      window.dataLayer?.push({ event: event_name, ...params });
    },
    []
  );

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm.trim().length > 2) {
        sendDataLayerEvent("search_city", {
          event_category: "City Search",
          event_label: searchTerm,
        });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, sendDataLayerEvent]);

  // Auth initialization
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      const auth = await getAuth();
      authRef.current = auth;
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsUserSignedIn(Boolean(user));
      });
    };

    initAuth();
    return () => {
      unsubscribe?.();
    };
  }, []);

  // URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    if (city) {
      setSelectedCity(city);
      setFilterCity(city);
    }
    const term = params.get("searchTerm");
    if (term) setSearchTerm(term);
  }, []);

  // Handlers
  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return showToast("Geolocation not supported", "error");
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        let closestCity: string | null = null;
        let minDistance = Infinity;

        for (const [city, coords] of Object.entries(initialCityCoordinates)) {
          const dist = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            coords.lat,
            coords.lng
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        }

        if (closestCity) {
          const normalized = normalizeCityName(closestCity);
          setSelectedCity(normalized);
          setFilterCity(normalized);
          setSearchTerm(normalized);
        } else {
          showToast("No supported cities found nearby", "info");
        }
      },
      () => showToast("Location access denied", "error")
    );
  }, [initialCityCoordinates, showToast]);

  const handleCitySelect = (city: string) => {
    setIsFirstDropdownOpen(false);
    const normalized = normalizeCityName(city);
    setSelectedCity(normalized);
    setFilterCity(normalized);
    setSearchTerm(normalized);
  };

  const handleCityFilterChange = (city: string) => {
    setIsSecondDropdownOpen(false);
    const normalized = city === "All Cities" ? "" : normalizeCityName(city);
    setFilterCity(city);
    setSelectedCity(normalized);
    setSearchTerm(normalized);
  };

  const handleEventSave = useCallback(
    async (event: Event) => {
      if (!isUserSignedIn) {
        showToast("Please sign in to save events.", "info");
        return;
      }
      try {
        const user = authRef.current?.currentUser;
        if (!user || !event.id) throw new Error("Invalid state");

        const token = await user.getIdToken();
        const response = await fetch("/api/events/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(event),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to save");

        showToast("Event saved successfully!", "success");
        sendDataLayerEvent("save_event", {
          event_category: "Event Interaction",
          event_label: event.name,
        });
      } catch {
        showToast("Failed to save event. Please try again.", "error");
      }
    },
    [isUserSignedIn, sendDataLayerEvent, showToast]
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  };

  const handleMapHover = useCallback(() => {
    setHasMapInit(true);
  }, []);

  const toggleMapVisibility = useCallback(() => {
    if (!hasMapInit) setHasMapInit(true);
    setIsMapVisible((prev) => !prev);
  }, [hasMapInit]);

  // Memoized data
  const dropdownCities = useMemo(() => {
    if (!debouncedSearchTerm) return initialCities;
    const term = debouncedSearchTerm.toLowerCase();
    return initialCities.filter((c) => c.toLowerCase().includes(term));
  }, [initialCities, debouncedSearchTerm]);

  const isTabMatch = useCallback(
    (event: Event) => {
      if (selectedTab === "Festivals") return event.isFestival;
      if (selectedTab === "Other") return event.isMusic;
      return !event.isFestival && !event.isMusic;
    },
    [selectedTab]
  );

  const eventsForMap = useMemo(() => {
    if (selectedTab === "Mics") return initialEvents;
    if (selectedTab === "Festivals")
      return initialEvents.filter((e) => e.isFestival);
    return initialEvents.filter((e) => e.isMusic);
  }, [initialEvents, selectedTab]);

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

  const filteredEventsForView = useMemo(() => {
    const dateCheck = new Date(selectedDate);
    dateCheck.setHours(0, 0, 0, 0);
    const term = debouncedSearchTerm.toLowerCase();
    const city = selectedCity.toLowerCase();

    return initialEvents.filter((e) => {
      if (!isTabMatch(e)) return false;

      const matchesCity = !city || e.location.toLowerCase().includes(city);
      const matchesSearch =
        !term ||
        e.name.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term);

      let matchesDate = false;
      if (e.isRecurring) {
        matchesDate = DAY_MAP[e.date] === selectedDate.getDay();
      } else {
        const parsedDate = new Date(e.date);
        if (!isNaN(parsedDate.getTime())) {
          parsedDate.setHours(0, 0, 0, 0);
          matchesDate = parsedDate.getTime() === dateCheck.getTime();
        }
      }

      return matchesCity && matchesDate && matchesSearch;
    });
  }, [
    initialEvents,
    selectedCity,
    selectedDate,
    debouncedSearchTerm,
    isTabMatch,
  ]);

  const sortedEventsByCity = useMemo(() => {
    let list = initialEvents.filter(isTabMatch);
    if (filterCity !== "All Cities") {
      list = list.filter(
        (e) => normalizeCityName(e.location.split(",")[1] || "") === filterCity
      );
    }
    return list.sort((a, b) => {
      const aClub = a.location.includes("Spokane Comedy Club");
      const bClub = b.location.includes("Spokane Comedy Club");
      if (aClub !== bClub) return aClub ? -1 : 1;
      return (b.numericTimestamp || 0) - (a.numericTimestamp || 0);
    });
  }, [initialEvents, filterCity, isTabMatch]);

  const rowVirtualizer = useVirtualizer({
    count: sortedEventsByCity.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  });

  const resultCountText = useMemo(() => {
    const count = filteredEventsForView.length;
    const type =
      selectedTab === "Mics"
        ? "mics"
        : selectedTab === "Festivals"
          ? "festivals"
          : "events";
    return `${count} ${type} found`;
  }, [filteredEventsForView.length, selectedTab]);

  return (
    <>
      {/* Hero - flat structure */}
      <div className="mb-4 flex justify-center">
        <EventForm />
      </div>

      <p className="mt-2 mb-4 text-center text-sm font-semibold text-stone-400 sm:text-base">
        Find your next show or night out. Pick a city and date!
      </p>

      {/* Inputs - grid instead of nested flex */}
      <div className="relative z-10 mt-2 grid justify-center gap-3 sm:gap-4">
        {/* City Dropdown */}
        <div className="relative w-80">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isFirstDropdownOpen}
            aria-label="Select a City"
            onMouseEnter={handleMapHover}
            onTouchStart={handleMapHover}
            onClick={() => {
              setIsFirstDropdownOpen(!isFirstDropdownOpen);
              setIsSecondDropdownOpen(false);
            }}
            className={`${dropdownBtnClass}`}
          >
            {selectedCity || "Select a City"}
          </button>

          {isFirstDropdownOpen && (
            <div className={`${dropdownContainerClass}`}>
              <label htmlFor="city-search" className="sr-only">
                Search cities
              </label>
              <input
                id="city-search"
                type="text"
                placeholder="Search city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={dropdownInputClass}
                autoComplete="off"
                autoFocus
              />
              <ul role="listbox" aria-label="Available cities">
                <li
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    fetchUserLocation();
                    setIsFirstDropdownOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-center gap-2 border-b border-zinc-200 bg-amber-100 px-4 py-3 text-center font-bold text-stone-900 hover:bg-amber-700"
                >
                  <span aria-hidden="true">📍</span> Use My Location
                </li>
                {dropdownCities.map((city) => (
                  <li
                    key={city}
                    role="option"
                    aria-selected={selectedCity === city}
                    onClick={() => handleCitySelect(city)}
                    className="cursor-pointer border-b border-zinc-200 px-4 py-2 text-center text-stone-900 last:border-0 hover:bg-amber-100"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Date Picker */}
        <div className="relative w-80">
          <label htmlFor="event-date-picker" className="sr-only">
            Select Event Date
          </label>
          <input
            id="event-date-picker"
            type="date"
            value={selectedDate.toLocaleDateString("en-CA")}
            onChange={handleDateChange}
            onMouseEnter={handleMapHover}
            onTouchStart={handleMapHover}
            onClick={(e) => e.currentTarget.showPicker()}
            className={`${dropdownBtnClass} cursor-pointer justify-center`}
          />
        </div>
      </div>

      {/* Map */}
      <section
        aria-label="Event Map"
        className="relative mt-6 mb-6 h-100 w-full rounded-2xl border-2 border-amber-700 bg-stone-800 shadow-lg"
      >
        <button
          type="button"
          onClick={toggleMapVisibility}
          onMouseEnter={handleMapHover}
          onTouchStart={handleMapHover}
          onFocus={handleMapHover}
          className={`absolute z-10 rounded-2xl px-4 py-2 font-bold shadow-lg transition-transform hover:scale-105 ${
            !isMapVisible
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-base text-white sm:text-lg"
              : "bottom-4 left-4 bg-stone-900 text-sm"
          }`}
        >
          {isMapVisible ? "Hide Map" : "Show Map"}
        </button>

        {hasMapInit && (
          <div
            className={`size-full transition-opacity duration-100 ${
              isMapVisible ? "visible opacity-100" : "invisible opacity-0"
            }`}
            aria-hidden={!isMapVisible}
          >
            <GoogleMap
              lat={mapConfig.lat}
              lng={mapConfig.lng}
              zoom={mapConfig.zoom}
              events={eventsForMap}
            />
          </div>
        )}
      </section>

      <p className="my-4 text-center text-sm text-stone-400 italic sm:my-6 sm:text-base md:text-lg">
        Scroll through events to find your next Mic or Festival!
      </p>

      {/* Tabs - moved above results for better flow */}
      <nav
        aria-label="Event type filter"
        role="tablist"
        className="flex flex-wrap justify-center gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`rounded-2xl px-3 py-2 text-sm font-bold shadow-lg transition-transform sm:text-base ${
              selectedTab === tab.id
                ? `${tab.activeClass} text-white ring-2 ring-zinc-200`
                : tab.inactiveClass
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Results */}
      <section
        aria-labelledby="results-heading"
        className="mt-6 mb-10 w-full rounded-2xl shadow-lg sm:mt-10"
      >
        <h2
          id="results-heading"
          className="font-heading mb-4 rounded-2xl border-b-4 border-amber-700 pb-2 text-center text-2xl shadow-lg sm:mb-6 sm:text-3xl"
        >
          {selectedTab === "Mics"
            ? "Comedy Mics"
            : selectedTab === "Festivals"
              ? "Festivals"
              : "Music/All Arts"}
        </h2>

        <p className="sr-only" aria-live="polite">
          {resultCountText}
        </p>

        {!selectedCity ? (
          <p className="py-4 text-center text-base sm:text-lg">
            Please select a city above to see events.
          </p>
        ) : filteredEventsForView.length > 0 ? (
          <ul aria-label={resultCountText}>
            {filteredEventsForView.map((event) => (
              <li key={event.id}>
                <EventCard event={event} onSave={handleEventSave} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-stone-400">
            No {selectedTab.toLowerCase()} found for {selectedCity} on{" "}
            {selectedDate.toLocaleDateString()}.
          </p>
        )}
      </section>

      {/* All Cities Section - simplified */}
      <section
        aria-labelledby="all-events-heading"
        className="relative z-10 my-8 grid w-full justify-items-center gap-4 rounded-2xl p-2 shadow-lg sm:my-10"
      >
        <div className="relative w-80">
          <button
            type="button"
            aria-label="Filter by City"
            aria-haspopup="listbox"
            aria-expanded={isSecondDropdownOpen}
            onClick={() => {
              setIsSecondDropdownOpen(!isSecondDropdownOpen);
              setIsFirstDropdownOpen(false);
            }}
            className={`${dropdownBtnClass} font-bold`}
          >
            {filterCity}
          </button>

          {isSecondDropdownOpen && (
            <div className={dropdownContainerClass}>
              <label htmlFor="filter-city-input" className="sr-only">
                Search city filter
              </label>
              <input
                id="filter-city-input"
                name="filter-city-input"
                autoComplete="off"
                type="text"
                placeholder="Search for a city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={dropdownInputClass}
                autoFocus
                aria-label="Search filter cities"
              />
              <ul className="max-h-48 overflow-y-auto" role="listbox">
                <li
                  role="option"
                  aria-selected={filterCity === "All Cities"}
                  onClick={() => handleCityFilterChange("All Cities")}
                  className={`cursor-pointer border-b border-zinc-200 px-4 py-2 text-center text-stone-900 hover:bg-stone-300 ${
                    filterCity === "All Cities"
                      ? "bg-zinc-200 font-semibold"
                      : ""
                  }`}
                >
                  All Cities
                </li>
                {dropdownCities.map((city) => (
                  <li
                    key={city}
                    role="option"
                    aria-selected={filterCity === city}
                    onClick={() => handleCityFilterChange(city)}
                    className={`cursor-pointer border-b border-zinc-200 px-4 py-2 text-center text-stone-900 last:border-0 hover:bg-stone-300 ${
                      filterCity === city ? "bg-zinc-200 font-semibold" : ""
                    }`}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <h2
          id="all-events-heading"
          className="font-heading w-full rounded-2xl border-b-4 border-amber-700 pb-2 text-center text-2xl shadow-lg sm:text-3xl"
        >
          {filterCity === "All Cities"
            ? `All ${selectedTab === "Mics" ? "Mics" : selectedTab === "Festivals" ? "Festivals" : "Arts"}`
            : `All ${selectedTab === "Mics" ? "Mics" : selectedTab === "Festivals" ? "Festivals" : "Arts"} in ${filterCity}`}
        </h2>

        {sortedEventsByCity.length === 0 ? (
          <p className="py-4 text-center text-stone-400">
            No events found for {filterCity}.
          </p>
        ) : (
          <div
            ref={parentRef}
            className="scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-stone-800 h-96 w-full overflow-y-auto rounded-2xl border border-stone-600 contain-strict sm:h-125 md:h-150"
            role="feed"
            aria-label={`${sortedEventsByCity.length} events`}
          >
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const event = sortedEventsByCity[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={rowVirtualizer.measureElement}
                    className="absolute top-0 left-0 w-full"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <EventCard event={event} onSave={handleEventSave} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
