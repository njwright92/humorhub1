"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import type { Auth } from "firebase/auth";
import { useToast } from "@/app/components/ToastContext";
import type { Event, CityCoordinates } from "../lib/types";
import {
  DEFAULT_US_CENTER,
  DEFAULT_ZOOM,
  CITY_ZOOM,
  ALL_CITIES_LABEL,
} from "../lib/constants";
import { getDistanceFromLatLonInKm, normalizeCityName } from "../lib/utils";
import EventCard from "./EventCard";

const GoogleMap = dynamic(() => import("@/app/components/GoogleMap"), {
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
  initialEvents: Event[];
  initialCityCoordinates: CityCoordinates;
  initialCities: string[];
}

const inputClass =
  "flex h-full w-full items-center justify-center rounded-2xl border-2 border-stone-500 bg-zinc-200 p-2 px-3 text-center font-semibold text-stone-900 shadow-lg outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-700/50";

const sectionHeadingClass =
  "mb-4 w-full rounded-2xl border-b-4 pb-2 text-center text-xl sm:text-2xl";

const emptyStateClass = "py-4 text-center text-stone-400";

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

const TAB_LABELS: Record<TabId, string> = {
  Mics: "Comedy Mics",
  Festivals: "Festivals/Competitions",
  Other: "Music/All-Arts Mics",
};

async function sendGtmEvent(
  event_name: string,
  params: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== "production") return;
  const { sendGTMEvent } = await import("@next/third-parties/google");
  sendGTMEvent({ event: event_name, ...params });
}

export default function MicFinderClient({
  initialEvents,
  initialCityCoordinates,
  initialCities,
}: MicFinderClientProps) {
  const { showToast } = useToast();

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(new Date().toDateString())
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [hasMapInit, setHasMapInit] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>("Mics");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const authRef = useRef<Auth | null>(null);
  const authInitPromiseRef = useRef<Promise<Auth> | null>(null);

  const sendDataLayerEvent = useCallback(
    (event_name: string, params: Record<string, unknown>) => {
      void sendGtmEvent(event_name, params);
    },
    []
  );

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

  const ensureAuth = useCallback(async (): Promise<Auth> => {
    if (authRef.current) return authRef.current;

    if (!authInitPromiseRef.current) {
      authInitPromiseRef.current = (async () => {
        const { getAuth } = await import("@/app/lib/firebase-auth");
        const auth = await getAuth();
        authRef.current = auth;
        return auth;
      })();
    }

    return authInitPromiseRef.current;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    const term = params.get("searchTerm");

    if (city) {
      const normalized = normalizeCityName(city);
      setSelectedCity(normalized);
      setSearchTerm(normalized);
    } else if (term) {
      setSearchTerm(term);
    }
    if (city || term) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
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
          setSearchTerm(normalized);
        } else {
          showToast("No supported cities found nearby", "info");
        }
      },
      () => showToast("Location access denied", "error")
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
        const auth = await ensureAuth();
        const user = auth.currentUser;

        if (!user) {
          showToast("Please sign in to save events.", "info");
          return;
        }
        if (!event.id) throw new Error("Invalid state");

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
    [ensureAuth, sendDataLayerEvent, showToast]
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;
      const [year, month, day] = e.target.value.split("-").map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    },
    []
  );

  const handleMapHover = useCallback(() => {
    setHasMapInit(true);
  }, []);

  const toggleMapVisibility = useCallback(() => {
    if (!hasMapInit) setHasMapInit(true);
    setIsMapVisible((prev) => !prev);
  }, [hasMapInit]);

  const cityLower = useMemo(() => selectedCity.toLowerCase(), [selectedCity]);

  const { selectedDow, dateCheckMs, dayOfWeek, formattedDate } = useMemo(() => {
    const dow = selectedDate.getDay();
    const dateCheck = new Date(selectedDate);
    dateCheck.setHours(0, 0, 0, 0);

    return {
      selectedDow: dow,
      dateCheckMs: dateCheck.getTime(),
      dayOfWeek: selectedDate.toLocaleDateString("en-US", { weekday: "long" }),
      formattedDate: selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }, [selectedDate]);

  const tabLabel = TAB_LABELS[selectedTab];

  const dropdownCities = useMemo(() => {
    if (!debouncedSearchTerm) return initialCities;
    const term = debouncedSearchTerm.toLowerCase();
    return initialCities.filter((c) => c.toLowerCase().startsWith(term));
  }, [initialCities, debouncedSearchTerm]);

  const isTabMatch = useCallback(
    (event: Event): boolean => {
      if (selectedTab === "Festivals") return event.isFestival;
      if (selectedTab === "Other") return event.isMusic;
      return !event.isFestival && !event.isMusic;
    },
    [selectedTab]
  );

  const eventsForMap = useMemo(() => {
    let events = initialEvents;

    if (cityLower && cityLower !== ALL_CITIES_LABEL) {
      events = events.filter((e) => e.locationLower.includes(cityLower));
    }

    return events.filter(isTabMatch);
  }, [initialEvents, cityLower, isTabMatch]);

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

  const recurringEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      if (!e.isRecurring || !isTabMatch(e)) return false;
      const matchesCity = !cityLower || e.locationLower.includes(cityLower);
      return matchesCity && e.recurringDow === selectedDow;
    });
  }, [initialEvents, cityLower, selectedDow, isTabMatch]);

  const oneTimeEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      if (e.isRecurring || !isTabMatch(e)) return false;
      const matchesCity = !cityLower || e.locationLower.includes(cityLower);
      return matchesCity && e.dateMs === dateCheckMs;
    });
  }, [initialEvents, cityLower, dateCheckMs, isTabMatch]);

  const allCityEvents = useMemo(() => {
    let list = initialEvents.filter(isTabMatch);
    if (cityLower && cityLower !== ALL_CITIES_LABEL) {
      list = list.filter((e) => e.locationLower.includes(cityLower));
    }
    return list;
  }, [initialEvents, cityLower, isTabMatch]);

  return (
    <>
      <div className="relative z-20 mt-2 grid justify-center gap-3 sm:flex sm:gap-4">
        <div className="relative w-80 sm:w-64">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isCityDropdownOpen}
            aria-label="Select a City"
            onMouseEnter={handleMapHover}
            onTouchStart={handleMapHover}
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className={inputClass}
          >
            {selectedCity || "Select a City"}
          </button>

          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 max-h-48 w-full overflow-auto rounded-2xl border border-stone-300 bg-zinc-200 shadow-lg">
              <label htmlFor="city-search" className="sr-only">
                Search cities
              </label>
              <input
                id="city-search"
                type="text"
                placeholder="Search city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-b-2 bg-zinc-200 px-3 py-2 text-stone-900 outline-hidden"
                autoComplete="off"
                autoFocus
              />
              <ul role="listbox" aria-label="Available cities">
                <li
                  role="option"
                  aria-selected={false}
                  onClick={() => {
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
                  onClick={() => {
                    setSelectedCity("All Cities");
                    setIsCityDropdownOpen(false);
                  }}
                  className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-50 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700 hover:text-white"
                >
                  <span aria-hidden="true">🌎</span> All Cities
                </li>
                {dropdownCities.map((city) => (
                  <li
                    key={city}
                    role="option"
                    aria-selected={selectedCity === city}
                    onClick={() => handleCitySelect(city)}
                    className="cursor-pointer border-b border-stone-400 px-4 py-2 text-center text-stone-900 last:border-0 hover:bg-amber-100"
                  >
                    {city}
                  </li>
                ))}
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
            value={selectedDate.toLocaleDateString("en-CA")}
            onChange={handleDateChange}
            onMouseEnter={handleMapHover}
            onTouchStart={handleMapHover}
            onClick={(e) => e.currentTarget.showPicker()}
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
        ) : recurringEvents.length > 0 ? (
          <div role="list" className="grid gap-4">
            {recurringEvents.map((event) => (
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
        ) : oneTimeEvents.length > 0 ? (
          <div role="list" className="grid gap-4">
            {oneTimeEvents.map((event) => (
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
        className="card-shell card-border-2 relative mt-6 mb-6 h-96 w-full border-amber-700 bg-stone-800"
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
        ) : allCityEvents.length === 0 ? (
          <p className={emptyStateClass}>
            No {tabLabel.toLowerCase()} found
            {selectedCity && selectedCity !== "All Cities"
              ? ` in ${selectedCity}`
              : ""}
            .
          </p>
        ) : (
          <VirtualizedEventList
            events={allCityEvents}
            onSave={handleEventSave}
            className="h-96 w-full overflow-auto rounded-2xl border border-stone-600 contain-strict sm:h-125 md:h-150"
            ariaLabel={`${allCityEvents.length} ${tabLabel.toLowerCase()}`}
          />
        )}
      </section>
    </>
  );
}
