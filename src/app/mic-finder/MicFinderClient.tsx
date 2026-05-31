"use client";

import {
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
  MapEvent,
  CityCoordinates,
  EventCategory,
  MicFinderFilterResult,
} from "../lib/types";
import {
  DEFAULT_US_CENTER,
  DEFAULT_ZOOM,
  CITY_ZOOM,
  EVENT_CATEGORIES,
} from "../lib/constants";
import {
  getDistanceFromLatLonInKm,
  normalizeCityName,
  buildFilterUrl,
} from "../lib/utils";
import EventCard from "./EventCard";
import { saveEvent } from "@/app/actions/events";
import { useSession } from "@/app/components/SessionContext";

const GoogleMap = dynamic(() => import("@/app/components/GoogleMap"), {
  ssr: false,
  loading: () => (
    <span className="grid size-full place-content-center text-stone-500">
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
  initialCity: string;
}

interface CitySelectorProps {
  initialCities: string[];
  selectedCity: string;
  initialSearchTerm: string;
  onCitySelect: (city: string) => void;
  onUseLocation: () => void;
}

const inputClass =
  "flex h-full min-h-11 w-full items-center justify-center rounded-2xl border-2 border-stone-500 bg-zinc-200 px-3 py-2 text-center leading-tight font-semibold text-stone-900 outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-700";
const sectionHeadingClass =
  "mb-4 min-h-14 w-full rounded-2xl border-b-4 pb-2 text-2xl leading-tight md:text-3xl";
const emptyStateClass = "py-4 text-stone-400";
const MAX_CITY_RESULTS = 40;

const TABS = [
  {
    id: "Mics",
    label: "Comedy Mics",
    activeClass: "bg-amber-700",
    activeTextClass: "text-stone-900",
    inactiveClass: "bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold",
  },
  {
    id: "Festivals",
    label: "Festivals",
    activeClass: "bg-purple-700",
    activeTextClass: "text-white",
    inactiveClass:
      "bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold",
  },
  {
    id: "Other",
    label: "Music/All Arts",
    activeClass: "bg-green-700",
    activeTextClass: "text-white",
    inactiveClass: "bg-green-100 text-green-800 hover:bg-green-200 font-bold",
  },
] as const;

const TAB_LABELS: Record<EventCategory, string> = {
  Mics: "Comedy Mics",
  Festivals: "Festivals/Competitions",
  Other: "Music/All-Arts Mics",
};

function formatDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}

function formatNativeDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseNativeDateInput(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

const CityDropdownList = memo(function CityDropdownList({
  searchTerm,
  initialCities,
  onCitySelect,
  onUseLocation,
}: {
  searchTerm: string;
  initialCities: string[];
  onCitySelect: (city: string) => void;
  onUseLocation: () => void;
}) {
  const dropdownCities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = term
      ? initialCities.filter((city) => city.toLowerCase().startsWith(term))
      : initialCities;
    return matches.slice(0, MAX_CITY_RESULTS);
  }, [searchTerm, initialCities]);

  return (
    <ul
      role="listbox"
      className="absolute top-full left-0 z-30 mt-1 max-h-48 w-full overflow-auto rounded-2xl border border-stone-400 bg-zinc-200 shadow-xl"
    >
      <li
        onMouseDown={(e) => {
          e.preventDefault();
          onUseLocation();
        }}
        className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-100 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700"
      >
        <span aria-hidden="true">📍</span> Use My Location
      </li>
      <li
        onMouseDown={(e) => {
          e.preventDefault();
          onCitySelect("All Cities");
        }}
        className="grid cursor-pointer grid-flow-col place-content-center gap-2 border-b border-stone-400 bg-amber-50 px-4 py-3 font-bold text-stone-900 hover:bg-amber-700"
      >
        <span aria-hidden="true">🌎</span> All Cities
      </li>
      {dropdownCities.map((city) => (
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
  );
});

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
        <CityDropdownList
          searchTerm={deferredSearchTerm}
          initialCities={initialCities}
          onCitySelect={onCitySelect}
          onUseLocation={onUseLocation}
        />
      )}
    </div>
  );
});

export default function MicFinderClient({
  initialCityCoordinates,
  initialCities,
  initialFilters,
  initialDate,
  initialCity,
}: MicFinderClientProps) {
  const { showToast } = useToast();
  const { session, refreshSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const nativeDateInputRef = useRef<HTMLInputElement>(null);

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [citySearchTerm, setCitySearchTerm] = useState(initialCity);

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (!initialDate) return new Date();
    const [year, month, day] = initialDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  const [dateInputValue, setDateInputValue] = useState(() =>
    formatDateInput(
      initialDate
        ? (() => {
            const [year, month, day] = initialDate.split("-").map(Number);
            return new Date(year, month - 1, day);
          })()
        : new Date(),
    ),
  );

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<EventCategory>(
    EVENT_CATEGORIES[0],
  );
  const [eventData, setEventData] =
    useState<MicFinderFilterResult>(initialFilters);
  const [mapPins, setMapPins] = useState<MapEvent[]>([]);

  useEffect(() => {
    const city = searchParams.get("city");
    const term = searchParams.get("searchTerm");
    if (city || term) router.replace(pathname, { scroll: false });
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
          startTransition(() => {
            setSelectedCity(normalized);
            setCitySearchTerm(normalized);
          });
        }
      },
      () => showToast("Location access denied", "error"),
    );
  }, [initialCityCoordinates, showToast, startTransition]);

  const handleCitySelect = useCallback(
    (city: string) => {
      const normalized = normalizeCityName(city);
      startTransition(() => {
        setSelectedCity(normalized);
        setCitySearchTerm(normalized);
      });
    },
    [startTransition],
  );

  const handleEventSave = useCallback(
    async (event: Event) => {
      try {
        const current =
          session.status === "ready" ? session : await refreshSession();
        if (!current.signedIn)
          return showToast("Please sign in to save events.", "info");
        const result = await saveEvent({ ...event });
        if (!result.success) throw new Error();
        showToast("Event saved successfully!", "success");
      } catch {
        showToast("Failed to save event.", "error");
      }
    },
    [refreshSession, session, showToast],
  );

  const handleTabSelect = useCallback(
    (tab: EventCategory) => {
      startTransition(() => {
        setSelectedTab(tab);
      });
    },
    [startTransition],
  );

  const { dayOfWeek, formattedDate } = useMemo(() => {
    if (!selectedDate) return { dayOfWeek: "", formattedDate: "" };
    return {
      dayOfWeek: selectedDate.toLocaleDateString("en-US", { weekday: "long" }),
      formattedDate: selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }, [selectedDate]);

  const nativeDateInputValue = useMemo(
    () => (selectedDate ? formatNativeDateInput(selectedDate) : ""),
    [selectedDate],
  );

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setDateInputValue(formatDateInput(date));
  }, []);

  const handleDateTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const isDeleting = raw.length < dateInputValue.length;

      if (isDeleting) {
        setDateInputValue(raw);
        return;
      }

      const digits = raw.replace(/\D/g, "").slice(0, 8);
      const formatted =
        digits.length <= 2
          ? digits
          : digits.length <= 4
            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
            : `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

      setDateInputValue(formatted);
      const nextDate = parseDateInput(formatted);
      if (nextDate) setSelectedDate(nextDate);
    },
    [dateInputValue],
  );

  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    const controller = new AbortController();
    const fetchFilters = async () => {
      try {
        const response = await fetch(
          buildFilterUrl(selectedTab, selectedCity, selectedDate),
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data: MicFinderFilterResult = await response.json();
        startTransition(() => setEventData(data));
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
      }
    };
    void fetchFilters();
    return () => controller.abort();
  }, [selectedCity, selectedDate, selectedTab]);

  useEffect(() => {
    if (!isMapVisible) return;
    const controller = new AbortController();
    const fetchAllMapPins = async () => {
      try {
        const filterUrl = buildFilterUrl(
          selectedTab,
          "All Cities",
          selectedDate,
        );
        const response = await fetch(`${filterUrl}&view=map`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { allCityEvents?: MapEvent[] };
        setMapPins(data.allCityEvents || []);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
      }
    };
    void fetchAllMapPins();
    return () => controller.abort();
  }, [selectedTab, selectedDate, isMapVisible]);

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
      <div className="relative z-20 my-2 grid w-full items-center justify-items-center gap-3 sm:flex sm:justify-center sm:gap-6">
        <CitySelector
          initialCities={initialCities}
          selectedCity={selectedCity}
          initialSearchTerm={citySearchTerm}
          onCitySelect={handleCitySelect}
          onUseLocation={fetchUserLocation}
        />

        {/* Date input with iOS-compatible native date picker */}
        <div className="relative h-11 w-full max-w-80 sm:w-52">
          <label htmlFor="event-date-text" className="sr-only">
            Select Event Date
          </label>
          <input
            id="event-date-text"
            type="text"
            inputMode="numeric"
            placeholder="MM/DD/YYYY"
            value={dateInputValue}
            onChange={handleDateTextChange}
            onBlur={() => {
              if (selectedDate)
                setDateInputValue(formatDateInput(selectedDate));
            }}
            className={`${inputClass} pr-12 text-center md:text-left`}
            autoComplete="off"
          />

          {/*
           * iOS Safari fix:
           * The native date input sits on top of the calendar icon area.
           * It is transparent (opacity-0) but pointer-events are enabled,
           * so tapping the icon area triggers the native iOS date wheel picker.
           * On desktop, clicking also opens the browser's native date picker.
           */}
          <div className="absolute top-1/2 right-2 size-8 -translate-y-1/2">
            {/* Calendar icon — purely visual, sits behind the native input */}
            <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg text-stone-900">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>

            {/* Transparent native date input overlaid on the icon */}
            <input
              ref={nativeDateInputRef}
              type="date"
              value={nativeDateInputValue}
              onChange={(event) => {
                const nextDate = parseNativeDateInput(event.target.value);
                if (nextDate) handleDateSelect(nextDate);
              }}
              aria-label="Open calendar"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>

      <nav
        role="tablist"
        className="my-6 grid w-full auto-cols-auto grid-flow-col justify-center gap-2 sm:my-8"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.id}
            onClick={() => handleTabSelect(tab.id)}
            className={`rounded-2xl px-2 py-3 leading-tight font-bold whitespace-nowrap transition-all sm:text-lg ${
              selectedTab === tab.id
                ? `${tab.activeClass} ${tab.activeTextClass} ring-2 ring-zinc-200`
                : tab.inactiveClass
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={`grid w-full ${isPending ? "opacity-60" : ""}`}>
        <section className="card-shell my-2 w-full" aria-label="Weekly events">
          <h2 className={`${sectionHeadingClass} border-amber-700`}>
            {dayOfWeek} {TAB_LABELS[selectedTab]}
            {selectedCity && ` in ${selectedCity}`}
          </h2>
          {!selectedCity ? (
            <p className="py-4">Select a city to see weekly events.</p>
          ) : eventData.recurringEvents.length > 0 ? (
            eventData.recurringEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSave={handleEventSave}
              />
            ))
          ) : (
            <p className={emptyStateClass}>
              No weekly {TAB_LABELS[selectedTab].toLowerCase()} found.
            </p>
          )}
        </section>

        <section
          className="card-shell my-2 w-full"
          aria-label="One-time events"
        >
          <h2 className={`${sectionHeadingClass} border-purple-700`}>
            {formattedDate} {TAB_LABELS[selectedTab]}
            {selectedCity && ` in ${selectedCity}`}
          </h2>
          {!selectedCity ? (
            <p className="py-4">Select a city to see one-time events.</p>
          ) : eventData.oneTimeEvents.length > 0 ? (
            eventData.oneTimeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSave={handleEventSave}
              />
            ))
          ) : (
            <p className={emptyStateClass}>
              No one-time {TAB_LABELS[selectedTab].toLowerCase()} found.
            </p>
          )}
        </section>

        <section
          className="card-base relative my-8 h-96 w-full overflow-hidden border-amber-700 bg-stone-900/10 shadow-xl contain-paint"
          aria-label="Map"
        >
          <button
            type="button"
            onClick={() => setIsMapVisible((visible) => !visible)}
            className="btn-primary absolute bottom-6 left-6 z-10 text-sm"
          >
            {isMapVisible ? "Hide Map" : "Show Map"}
          </button>
          {isMapVisible ? (
            <GoogleMap
              lat={mapConfig.lat}
              lng={mapConfig.lng}
              zoom={mapConfig.zoom}
              events={mapPins}
            />
          ) : (
            <div className="grid size-full place-content-center opacity-80">
              <span className="text-8xl" aria-hidden="true">
                🗺️
              </span>
            </div>
          )}
        </section>

        <section
          className="card-shell relative z-10 my-2 grid w-full justify-items-center gap-5 p-3"
          aria-label="All city events"
        >
          <h2 className={`${sectionHeadingClass} border-amber-700`}>
            All {TAB_LABELS[selectedTab]}
            {selectedCity && ` in ${selectedCity}`}
          </h2>
          {eventData.allCityEvents.length > 0 ? (
            <VirtualizedEventList
              events={eventData.allCityEvents}
              onSave={handleEventSave}
              className="h-96 w-full overflow-auto rounded-2xl border border-stone-700 sm:h-125 md:h-150"
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
