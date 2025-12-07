"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import dynamic from "next/dynamic";
import { db } from "../../../firebase.config";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";
import EventForm from "../components/EventForm";
import type { Auth } from "firebase/auth";
import { useToast } from "../components/ToastContext";

// --- Utils & Constants ---

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DAY_MAP: { [key: string]: number } = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// ⭐ NEW: Default map settings
const DEFAULT_US_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const CITY_ZOOM = 12;

const MemoizedEventForm = React.memo(EventForm);

const GoogleMap = dynamic(() => import("../components/GoogleMap"), {
  loading: () => (
    <div className="h-100 w-full flex items-center justify-center text-zinc-200">
      Loading Map...
    </div>
  ),
  ssr: false,
});

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

type Event = {
  id: string;
  name: string;
  location: string;
  date: string;
  lat: number;
  lng: number;
  details: string;
  isRecurring: boolean;
  festival: boolean;
  isMusic?: boolean;
  parsedDateObj?: Date;
  numericTimestamp?: number;
  googleTimestamp?: string | number | Date;
};

type CityCoordinates = { [key: string]: { lat: number; lng: number } };

export default function MicFinderClient() {
  const { showToast } = useToast();

  // State
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("All Cities");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [hasMapInit, setHasMapInit] = useState(false);
  const [cityCoordinates, setCityCoordinates] = useState<CityCoordinates>({});
  const [isFirstDropdownOpen, setIsFirstDropdownOpen] = useState(false);
  const [isSecondDropdownOpen, setIsSecondDropdownOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "Mics" | "Festivals" | "Other"
  >("Mics");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const authRef = useRef<Auth | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const normalizeCityName = useCallback((name: string) => name.trim(), []);
  const sendDataLayerEvent = useCallback(
    (event_name: string, params: Record<string, unknown>) => {
      if (typeof window !== "undefined") {
        window.dataLayer?.push({ event: event_name, ...params });
      }
    },
    []
  );

  // --- Effects ---

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

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const [eventsSnap, citiesSnap] = await Promise.all([
          getDocs(collection(db, "userEvents")),
          getDocs(collection(db, "cities")),
        ]);

        const fetchedEvents = eventsSnap.docs.map((doc) => {
          const data = doc.data();
          const parsedDateObj = data.date ? new Date(data.date) : undefined;
          if (parsedDateObj && !isNaN(parsedDateObj.getTime()))
            parsedDateObj.setHours(0, 0, 0, 0);

          return {
            id: doc.id,
            ...data,
            festival: data.festival === true,
            isMusic: data.isMusic === true,
            parsedDateObj,
            numericTimestamp: data.googleTimestamp
              ? new Date(data.googleTimestamp).getTime()
              : 0,
          } as Event;
        });
        const citiesData: CityCoordinates = {};
        citiesSnap.docs.forEach((doc) => {
          const d = doc.data();
          citiesData[d.city] = {
            lat: d.coordinates.lat,
            lng: d.coordinates.lng,
          };
        });
        if (mounted) {
          setEvents(fetchedEvents);
          setCityCoordinates(citiesData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      const auth = await getAuth();
      authRef.current = auth;
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsUserSignedIn(!!user);
      });
    };
    setTimeout(initAuth, 100);
    return () => unsubscribe?.();
  }, []);

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

  useEffect(() => {
    if (selectedCity && cityCoordinates[selectedCity]) {
      setMapLocation(cityCoordinates[selectedCity]);
    } else {
      setMapLocation(null); // ⭐ CHANGED: null when no city selected
    }
  }, [selectedCity, cityCoordinates]);

  // --- Handlers ---

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation)
      return showToast("Geolocation not supported", "error");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        let closestCity = null;
        let minDistance = Infinity;
        for (const [city, coords] of Object.entries(cityCoordinates)) {
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
      (err) => {
        console.error("Geo error", err);
        showToast("Location access denied", "error");
      }
    );
  }, [cityCoordinates, normalizeCityName, showToast]);

  const handleCitySelect = (city: string) => {
    const normalized = normalizeCityName(city);
    setSelectedCity(normalized);
    setFilterCity(normalized);
    setSearchTerm(normalized);
    setIsFirstDropdownOpen(false);
  };

  const handleCityFilterChange = (city: string) => {
    const normalized = city === "All Cities" ? "" : normalizeCityName(city);
    setFilterCity(city);
    setSelectedCity(normalized);
    setSearchTerm(normalized);
    setIsSecondDropdownOpen(false);
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

        const { doc, setDoc } = await import("firebase/firestore");

        const dataToSave: Record<string, unknown> = {
          id: event.id,
          userId: user.uid,
        };

        if (event.name) dataToSave.name = event.name;
        if (event.location) dataToSave.location = event.location;
        if (event.date) dataToSave.date = event.date;
        if (event.lat != null) dataToSave.lat = event.lat;
        if (event.lng != null) dataToSave.lng = event.lng;
        if (event.details) dataToSave.details = event.details;
        if (event.isRecurring != null)
          dataToSave.isRecurring = event.isRecurring;
        if (event.festival != null) dataToSave.festival = event.festival;
        if (event.isMusic != null) dataToSave.isMusic = event.isMusic;
        if (event.googleTimestamp)
          dataToSave.googleTimestamp = event.googleTimestamp;

        await setDoc(doc(db, "savedEvents", event.id), dataToSave);

        showToast("Event saved successfully!", "success");
        sendDataLayerEvent("save_event", {
          event_category: "Event Interaction",
          event_label: event.name,
        });
      } catch (error) {
        console.error("Failed to save event:", error);
        showToast("Failed to save event. Please try again.", "error");
      }
    },
    [isUserSignedIn, sendDataLayerEvent, showToast]
  );

  const toggleMapVisibility = () => {
    if (!hasMapInit) setHasMapInit(true);
    setIsMapVisible((prev) => {
      return !prev;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
  };

  // --- Memos ---

  const allAvailableCities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const city = e.location.split(",")[1]?.trim();
      if (city) set.add(normalizeCityName(city));
    });
    return Array.from(set).sort((a, b) =>
      a === "Spokane WA" ? -1 : b === "Spokane WA" ? 1 : a.localeCompare(b)
    );
  }, [events, normalizeCityName]);

  const dropdownCities = useMemo(() => {
    return !debouncedSearchTerm
      ? allAvailableCities
      : allAvailableCities.filter((c) =>
          c.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
  }, [allAvailableCities, debouncedSearchTerm]);

  const isTabMatch = useCallback(
    (event: Event) => {
      if (selectedTab === "Festivals") return event.festival;
      if (selectedTab === "Other") return event.isMusic;
      return !event.festival && !event.isMusic;
    },
    [selectedTab]
  );

  // ⭐ NEW: Events filtered for map based on tab
  const eventsForMap = useMemo(() => {
    if (selectedTab === "Mics") {
      return events; // Show ALL events when Mics tab selected
    }
    if (selectedTab === "Festivals") {
      return events.filter((e) => e.festival);
    }
    // Other tab
    return events.filter((e) => e.isMusic);
  }, [events, selectedTab]);

  // ⭐ NEW: Map configuration based on city selection
  const mapConfig = useMemo(() => {
    if (mapLocation) {
      return {
        lat: mapLocation.lat,
        lng: mapLocation.lng,
        zoom: CITY_ZOOM,
      };
    }
    return {
      lat: DEFAULT_US_CENTER.lat,
      lng: DEFAULT_US_CENTER.lng,
      zoom: DEFAULT_ZOOM,
    };
  }, [mapLocation]);

  const filteredEventsForView = useMemo(() => {
    const dateCheck = new Date(selectedDate);
    dateCheck.setHours(0, 0, 0, 0);
    const term = debouncedSearchTerm.toLowerCase();
    const city = selectedCity.toLowerCase();
    return events.filter((e) => {
      if (!isTabMatch(e)) return false;
      const matchesCity = !city || e.location.toLowerCase().includes(city);
      const matchesSearch =
        !term ||
        e.name.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term);
      let matchesDate = false;
      if (e.isRecurring) {
        matchesDate = DAY_MAP[e.date] === selectedDate.getDay();
      } else if (e.parsedDateObj) {
        matchesDate = e.parsedDateObj.getTime() === dateCheck.getTime();
      }
      return matchesCity && matchesDate && matchesSearch;
    });
  }, [events, selectedCity, selectedDate, debouncedSearchTerm, isTabMatch]);

  const sortedEventsByCity = useMemo(() => {
    let list = events.filter(isTabMatch);
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
  }, [events, filterCity, isTabMatch, normalizeCityName]);

  const rowVirtualizer = useVirtualizer({
    count: sortedEventsByCity.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  });

  return (
    <>
      <Header />
      <div className="screen-container content-with-sidebar">
        <div className="border border-red-400 text-red-700 px-2 py-1 rounded-lg shadow-lg text-center mb-3 bg-zinc-200 text-sm sm:text-md">
          <p className="m-0">
            <strong className="font-bold">📢 Note: </strong>
            Open mic events evolve quickly. See something outdated?{" "}
            <Link
              href="/contact"
              className="underline font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              Contact Us
            </Link>{" "}
            Help keep the comedy community thriving!
          </p>
        </div>

        <h1 className="title text-center mb-6">MicFinder</h1>
        <h2 className="subtitle-style text-center mb-6">
          Discover Mics and Festivals Near You!
        </h2>
        <p className="text-center mt-4 mb-6">
          Share a mic or find your next one: MicFinder helps you discover and
          add comedy events to connect with your community and keep the laughs
          going!
        </p>

        <div className="text-center mb-4 h-16 w-full rounded-lg">
          <MemoizedEventForm />
        </div>

        <h3 className="text-md font-semibold text-center mt-4 sm:mt-2 mb-4 xs:mb-2">
          Find your next show or night out. Pick a city and date!
        </h3>

        <div className="flex flex-col justify-center items-center mt-2 relative z-20">
          <div className="relative w-full max-w-xs min-h-12">
            <p id="city-select-label" className="sr-only">
              Select a City
            </p>
            <div
              id="city-select"
              aria-labelledby="city-select-label"
              tabIndex={0}
              className="modern-input cursor-pointer bg-zinc-200 text-zinc-900 font-semibold flex items-center justify-center text-center px-3"
              role="button"
              aria-haspopup="listbox"
              aria-expanded={isFirstDropdownOpen}
              onClick={() => {
                setIsFirstDropdownOpen(!isFirstDropdownOpen);
                setIsSecondDropdownOpen(false);
              }}
            >
              {selectedCity || "Select a City"}
            </div>
            {isFirstDropdownOpen && (
              <div className="w-full max-w-xs bg-zinc-100 shadow-lg rounded-lg mt-1 absolute top-full left-0 max-h-48 overflow-y-auto z-30">
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full px-3 py-2 border-b bg-zinc-100 text-zinc-900 outline-none"
                  autoFocus
                />
                <ul className="text-zinc-900" role="listbox">
                  <li
                    className="px-4 py-3 cursor-pointer bg-amber-100 hover:bg-amber-300 text-center font-bold text-zinc-900 border-b border-zinc-200 flex justify-center items-center gap-2"
                    onClick={() => {
                      fetchUserLocation();
                      setIsFirstDropdownOpen(false);
                    }}
                  >
                    <span>📍</span> Use My Current Location
                  </li>
                  {dropdownCities.map((city) => (
                    <li
                      key={city}
                      role="option"
                      aria-selected={selectedCity === city}
                      className="px-4 py-2 cursor-pointer hover:bg-amber-100 text-center"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center items-center mt-2 w-full max-w-xs relative">
            <label htmlFor="event-date-picker" className="sr-only">
              Select Event Date
            </label>
            <input
              id="event-date-picker"
              name="event-date-picker"
              type="date"
              value={selectedDate.toLocaleDateString("en-CA")}
              onChange={handleDateChange}
              className="modern-input w-full cursor-pointer bg-zinc-200 text-zinc-900 font-semibold px-2"
            />
          </div>
        </div>

        <section className="w-full h-100 rounded-lg shadow-lg relative border border-amber-300 mt-6 overflow-hidden bg-zinc-800">
          <button
            onClick={toggleMapVisibility}
            className={`absolute z-10 rounded-lg shadow-lg px-4 py-2 transition cursor-pointer font-bold ${!isMapVisible ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 btn text-zinc-950 p-2" : "top-4 right-4 bg-zinc-900 text-zinc-200 hover:bg-zinc-950"}`}
          >
            {!isMapVisible ? "Show Map" : "Hide Map"}
          </button>
          {hasMapInit && (
            <div
              className={`h-full w-full transition-opacity duration-100 ${!isMapVisible ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              {/* ⭐ CHANGED: Use mapConfig and eventsForMap */}
              <GoogleMap
                lat={mapConfig.lat}
                lng={mapConfig.lng}
                zoom={mapConfig.zoom}
                events={eventsForMap}
              />
            </div>
          )}
          {!isMapVisible && <div className="absolute inset-0 bg-zinc-800" />}
        </section>

        <p className="text-md text-center mb-2 sm:mb-1 xs:mb-1 mt-6">
          *Scroll through events to find your next Mic or Festival!*
        </p>

        <section className="card-style">
          <h2 className="title text-center border-b-4 border-amber-300 pb-2">
            {selectedTab === "Mics"
              ? "Comedy Mics"
              : selectedTab === "Festivals"
                ? "Festivals"
                : "Music/All Arts"}
          </h2>

          {!selectedCity ? (
            <p className="text-center py-4">
              Please select a city above to see events.
            </p>
          ) : filteredEventsForView.length > 0 ? (
            filteredEventsForView.map((event) => (
              <div key={event.id} className="event-item">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="details-label">📅 Date: {event.date}</p>
                <p className="details-label">📍 Location: {event.location}</p>
                <div className="details-label">
                  <span className="details-label">ℹ️ Details:</span>
                  <div dangerouslySetInnerHTML={{ __html: event.details }} />
                </div>
                <button
                  className="btn mt-2 mb-2 text-zinc-950 self-center"
                  onClick={() => handleEventSave(event)}
                >
                  Save Event
                </button>
              </div>
            ))
          ) : (
            <p className="text-center py-4">
              No {selectedTab.toLowerCase()} found for {selectedCity} on{" "}
              {selectedDate.toLocaleDateString()}.
            </p>
          )}
        </section>

        <div className="tab-container flex justify-center mt-4 gap-1">
          <button
            className={`tab-button font-bold rounded-xl shadow-lg transition ${
              selectedTab === "Mics"
                ? "bg-blue-600 text-zinc-100 ring-2 ring-zinc-200 shadow-lg"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
            onClick={() => setSelectedTab("Mics")}
          >
            Comedy Mics
          </button>
          <button
            className={`tab-button font-bold rounded-xl shadow-lg transition ${
              selectedTab === "Festivals"
                ? "bg-purple-700 text-zinc-100 ring-2 ring-zinc-200 shadow-lg"
                : "bg-purple-100 text-purple-800 hover:bg-purple-200"
            }`}
            onClick={() => setSelectedTab("Festivals")}
          >
            Festivals
          </button>
          <button
            className={`tab-button font-bold rounded-xl shadow-lg transition ${
              selectedTab === "Other"
                ? "bg-green-600 text-zinc-100 ring-2 ring-zinc-200 shadow-lg"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            onClick={() => setSelectedTab("Other")}
          >
            Music/All arts
          </button>
        </div>

        <section className="card-style">
          <div className="flex flex-col justify-center items-center mt-2 relative z-10">
            <div className="relative w-full max-w-xs">
              <div
                id="city-filter-select"
                aria-label="Filter by City"
                className="modern-input cursor-pointer bg-zinc-100 text-zinc-900 px-3 flex items-center justify-center text-center"
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isSecondDropdownOpen}
                onClick={() => {
                  setIsSecondDropdownOpen(!isSecondDropdownOpen);
                  setIsFirstDropdownOpen(false);
                }}
              >
                {filterCity || "All Cities"}
              </div>
              {isSecondDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-30 bg-zinc-100 shadow-lg rounded-lg mt-1 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="w-full px-3 py-2 border-b-2 bg-zinc-200 text-zinc-900 outline-none"
                    autoFocus
                  />
                  <ul
                    className="max-h-48 overflow-y-auto text-zinc-900"
                    role="listbox"
                  >
                    <li
                      role="option"
                      aria-selected={filterCity === "All Cities"}
                      className={`px-4 py-2 cursor-pointer hover:bg-zinc300 text-center ${filterCity === "All Cities" ? "bg-zinc-200 font-semibold" : ""}`}
                      onClick={() => handleCityFilterChange("All Cities")}
                    >
                      All Cities
                    </li>
                    {dropdownCities.map((city) => (
                      <li
                        key={city}
                        role="option"
                        aria-selected={filterCity === city}
                        className={`px-4 py-2 cursor-pointer hover:bg-zinc-300 text-center ${filterCity === city ? "bg-zinc-200 font-semibold" : ""}`}
                        onClick={() => handleCityFilterChange(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <h2 className="title text-center mt-4 border-b-4 border-amber-300 pb-2">
            {filterCity === "All Cities"
              ? `All ${selectedTab === "Mics" ? "Mics" : selectedTab === "Festivals" ? "Festivals" : "Arts"}`
              : `All ${selectedTab === "Mics" ? "Mics" : selectedTab === "Festivals" ? "Festivals" : "Arts"} in ${filterCity}`}
          </h2>

          {sortedEventsByCity.length === 0 && (
            <p className="text-center py-4">
              No events found for {filterCity}.
            </p>
          )}

          <div
            ref={parentRef}
            className="w-full h-180 overflow-y-auto contain-strict bg-transparent"
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
                    <div className="event-item my-2 h-auto flex flex-col p-1">
                      <h3 className="text-xl font-bold">{event.name}</h3>
                      <p className="details-label">📅 Date: {event.date}</p>
                      <p className="details-label">
                        📍 Location: {event.location}
                      </p>
                      <div className="details-label mt-2">
                        <span className="details-label">ℹ️ Details:</span>
                        <div
                          dangerouslySetInnerHTML={{ __html: event.details }}
                        />
                      </div>
                      <button
                        className="btn mt-2 mb-2 text-zinc-950 self-center"
                        onClick={() => handleEventSave(event)}
                      >
                        Save Event
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
