"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  useTransition,
  useDeferredValue,
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

// --- UTILITIES ---
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

const GoogleMap = dynamic(() => import("@/app/components/GoogleMap"), {
  ssr: false,
  loading: () => (
    <span className="grid size-full place-content-center text-stone-300">
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

interface CitySelectorProps {
  initialCities: string[];
  selectedCity: string;
  initialSearchTerm: string;
  onCitySelect: (city: string) => void;
  onUseLocation: () => void;
}

const inputClass =
  "flex h-full min-h-11 w-full items-center justify-center rounded-2xl border-2 border-stone-500 bg-zinc-200 p-2 px-3 text-center leading-tight font-semibold text-stone-900 outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-700/50";
const sectionHeadingClass =
  "mb-4 min-h-14 w-full rounded-2xl border-b-4 pb-2 text-center text-xl leading-tight sm:min-h-12 sm:text-2xl";
const emptyStateClass = "py-4 text-center text-stone-400";
const MAX_CITY_RESULTS = 40;

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

const TAB_LABELS: Record<EventCategory, string> = {
  Mics: "Comedy Mics",
  Festivals: "Festivals/Competitions",
  Other: "Music/All-Arts Mics",
};

const CitySelector = memo(function CitySelector({
  initialCities,
  selectedCity,
  initialSearchTerm,
  onCitySelect,
  onUseLocation,
}: CitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState(
    initialSearchTerm || selectedCity,
  );
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    setSearchTerm(initialSearchTerm || selectedCity);
  }, [initialSearchTerm, selectedCity]);

  const dropdownCities = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    const matches = term
      ? initialCities.filter((city) => city.toLowerCase().startsWith(term))
      : initialCities;

    return {
      items: matches.slice(0, MAX_CITY_RESULTS),
      hiddenCount: Math.max(0, matches.length - MAX_CITY_RESULTS),
    };
  }, [deferredSearchTerm, initialCities]);

  return (
    <div className="relative h-11 w-full max-w-80 sm:w-64">
      <label htmlFor="city-search" className="sr-only">
        Search by City
      </label>
      <input
        id="city-search"
        name="city-search"
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
        onChange={(e) => setSearchTerm(e.target.value)}
        className={inputClass}
        autoComplete="off"
      />
      {isCityDropdownOpen && (
        <div className="absolute top-full left-0 z-30 mt-1 max-h-48 w-full overflow-auto rounded-2xl border border-stone-300 bg-zinc-200 shadow-xl">
          <ul role="listbox">
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                onUseLocation();
                setIsCityDropdownOpen(false);
              }}
              className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-100 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700"
            >
              <span aria-hidden="true">📍</span> Use My Location
            </li>
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                onCitySelect("All Cities");
                setIsCityDropdownOpen(false);
              }}
              className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-50 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700"
            >
              <span aria-hidden="true">🌎</span> All Cities
            </li>
            {dropdownCities.items.map((city) => (
              <li
                key={city}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onCitySelect(city);
                }}
                className="cursor-pointer border-b border-stone-400 px-4 py-2 text-center text-stone-900 last:border-0 hover:bg-amber-100"
              >
                {city}
              </li>
            ))}
          </ul>
          {dropdownCities.hiddenCount > 0 && (
            <p className="border-t border-stone-300 px-3 py-2 text-center text-xs font-semibold text-stone-600">
              Keep typing to narrow {dropdownCities.hiddenCount} more cities.
            </p>
          )}
        </div>
      )}
    </div>
  );
});

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

  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState("en-US");
  const [selectedCity, setSelectedCity] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    parseLocalDate(initialDate),
  );
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<EventCategory>("Mics");
  const [eventData, setEventData] =
    useState<MicFinderFilterResult>(initialFilters);

  useEffect(() => {
    setLocale(navigator.language || "en-US");
  }, []);

  useEffect(() => {
    const city = searchParams.get("city");
    const term = searchParams.get("searchTerm");
    if (city) {
      const normalized = normalizeCityName(city);
      setSelectedCity(normalized);
      setCitySearchTerm(normalized);
    } else if (term) {
      setCitySearchTerm(term);
    }
    if (city || term) router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const preloadModules = () => {
      void import("@/app/components/GoogleMap");
      void import("./VirtualizedEventList");
    };

    const browserGlobals = globalThis as typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof browserGlobals.requestIdleCallback === "function") {
      const idleId = browserGlobals.requestIdleCallback(preloadModules, {
        timeout: 1500,
      });
      return () => browserGlobals.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(preloadModules, 1200);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

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
          setCitySearchTerm(normalized);
        }
      },
      () => showToast("Location access denied", "error"),
    );
  }, [initialCityCoordinates, showToast]);

  const handleCitySelect = useCallback((city: string) => {
    const normalized = normalizeCityName(city);
    setSelectedCity(normalized);
    setCitySearchTerm(normalized);
  }, []);

  const handleEventSave = useCallback(
    async (event: Event) => {
      try {
        const current =
          session.status === "ready" ? session : await refreshSession();
        if (!current.signedIn)
          return showToast("Please sign in to save events.", "info");
        const result = await saveEvent(JSON.parse(JSON.stringify(event)));
        if (!result.success) throw new Error();
        showToast("Event saved successfully!", "success");
      } catch {
        showToast("Failed to save event.", "error");
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

  const toggleMapVisibility = useCallback(() => {
    setIsMapVisible((prev) => !prev);
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
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data: MicFinderFilterResult = await response.json();
        startTransition(() => {
          setEventData(data);
        });
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
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
      <div className="relative z-20 mt-2 grid min-h-12 w-full items-center justify-items-center gap-3 sm:flex sm:justify-center sm:gap-4">
        <CitySelector
          initialCities={initialCities}
          selectedCity={selectedCity}
          initialSearchTerm={citySearchTerm}
          onCitySelect={handleCitySelect}
          onUseLocation={fetchUserLocation}
        />
        <div className="relative h-11 w-full max-w-80 sm:w-48">
          <label htmlFor="event-date-picker" className="sr-only">
            Select Event Date
          </label>
          <input
            id="event-date-picker"
            name="event-date"
            type="date"
            value={formatDateInputValue(selectedDate)}
            onChange={handleDateChange}
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
        role="tablist"
        className="my-2 grid min-h-12 w-full auto-cols-auto grid-flow-col justify-center gap-1 sm:gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`rounded-2xl px-2 py-2 text-xs leading-tight font-bold whitespace-nowrap transition-all sm:px-3 sm:text-base ${selectedTab === tab.id ? `${tab.activeClass} ${tab.activeTextClass} ring-2 ring-zinc-200` : tab.inactiveClass}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div
        className={`grid w-full transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}
      >
        <section className="card-shell my-2 w-full">
          <h2 className={`${sectionHeadingClass} border-amber-700`}>
            {dayOfWeek} {TAB_LABELS[selectedTab]}
            {selectedCity && ` in ${selectedCity}`}
          </h2>
          {!selectedCity ? (
            <p className="py-4 text-center">
              Select a city to see weekly events.
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
              No weekly {TAB_LABELS[selectedTab].toLowerCase()} found.
            </p>
          )}
        </section>

        <section className="card-shell my-2 w-full">
          <h2 className={`${sectionHeadingClass} border-purple-700`}>
            {formattedDate} {TAB_LABELS[selectedTab]}
            {selectedCity && ` in ${selectedCity}`}
          </h2>
          {!selectedCity ? (
            <p className="py-4 text-center">
              Select a city to see one-time events.
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
              No one-time {TAB_LABELS[selectedTab].toLowerCase()} found.
            </p>
          )}
        </section>

        <section className="card-base shadow-soft relative my-2 h-96 w-full overflow-hidden border-amber-700 bg-stone-800 contain-paint">
          <button
            type="button"
            onClick={toggleMapVisibility}
            className={`shadow-soft absolute z-10 rounded-2xl px-4 py-2 font-bold transition-all ${!isMapVisible ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-stone-900" : "bottom-4 left-4 bg-stone-900 text-sm text-white"}`}
          >
            {isMapVisible ? "Hide Map" : "Show Map"}
          </button>
          {isMapVisible && (
            <div className="size-full">
              <GoogleMap
                lat={mapConfig.lat}
                lng={mapConfig.lng}
                zoom={mapConfig.zoom}
                events={eventData.baseEvents}
              />
            </div>
          )}
        </section>

        <section className="card-shell relative z-10 my-2 grid w-full justify-items-center gap-4 p-2">
          <h2 className={`${sectionHeadingClass} border-amber-700`}>
            All {TAB_LABELS[selectedTab]}
            {selectedCity && ` in ${selectedCity}`}
          </h2>
          {eventData.allCityEvents.length > 0 ? (
            <VirtualizedEventList
              events={eventData.allCityEvents}
              onSave={handleEventSave}
              className="h-96 w-full overflow-auto rounded-2xl border border-stone-600 sm:h-125 md:h-150"
              ariaLabel={`${eventData.allCityEvents.length} events`}
            />
          ) : (
            <p className={emptyStateClass}>
              No {TAB_LABELS[selectedTab].toLowerCase()} found.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
