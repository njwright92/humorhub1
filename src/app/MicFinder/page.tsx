"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import dynamic from "next/dynamic";
import { db, auth } from "../../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { FixedSizeList as List, areEqual } from "react-window";
import { parse, isValid } from "date-fns";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";
import EventForm from "../components/EventForm";

// --- Utility Functions ---

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Dynamic Imports ---

const GoogleMap = dynamic(() => import("../components/GoogleMap"), {
  loading: () => (
    <div className="h-[25rem] w-full rounded-xl flex items-center justify-center text-zinc-500">
      Loading Map...
    </div>
  ),
  ssr: false,
});

// --- Types ---

type Event = {
  googleTimestamp: any;
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
};

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

// Virtualized Row Component
const Row = React.memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: { events: Event[]; onSave: (e: Event) => void };
  }) => {
    const event = data.events[index];
    if (!event) return null;

    return (
      <div style={style}>
        <div className="event-item mt-2 mx-2 h-[96%] flex flex-col justify-center">
          <h3 className="text-lg font-semibold">{event.name}</h3>
          <p className="details-label">📅 Date: {event.date}</p>
          <p className="details-label">📍 Location: {event.location}</p>
          {event.festival && (
            <p className="details-label text-purple-600 font-bold">
              🏆 This is a festival!
            </p>
          )}
          {event.isMusic && !event.festival && (
            <p className="details-label text-green-600 font-bold">
              🎶 This is a Music/Other event!
            </p>
          )}
          <div className="details-label">
            <span className="details-label">ℹ️ Details:</span>
            <div dangerouslySetInnerHTML={{ __html: event.details }} />
          </div>
          <button
            className="btn mt-1 mb-1 px-2 py-1 self-center"
            onClick={() => data.onSave(event)}
          >
            Save Event
          </button>
        </div>
      </div>
    );
  },
  areEqual,
);

Row.displayName = "EventRow";

// --- Main Component ---

const EventsPage = () => {
  // State
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("All Cities");
  const [isMapVisible, setIsMapVisible] = useState(false);
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

  // Debounce for search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Constants / Helpers
  const normalizeCityName = useCallback((name: string) => name.trim(), []);

  const sendDataLayerEvent = useCallback(
    (
      event_name: string,
      params: { event_category: string; event_label: string },
    ) => {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: event_name, ...params });
      }
    },
    [],
  );

  // Tab Filter Logic
  const isTabMatch = useCallback(
    (event: Event) => {
      if (selectedTab === "Festivals") return event.festival;
      if (selectedTab === "Other") return event.isMusic;
      return !event.festival && !event.isMusic;
    },
    [selectedTab],
  );

  // Geo Logic
  const findClosestCity = useCallback(
    (latitude: number, longitude: number): string | null => {
      if (Object.keys(cityCoordinates).length === 0) return null;
      let closestCity: string | null = null;
      let minDistance = Infinity;

      for (const [city, coords] of Object.entries(cityCoordinates)) {
        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          coords.lat,
          coords.lng,
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }
      return closestCity;
    },
    [cityCoordinates],
  );

  // --- Effects ---

  // Debounce Search Term
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // --- Optimized Data Fetching ---
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // 1. Check Cache First (Instant Render)
      const cachedEvents = sessionStorage.getItem("hh_events");
      const cachedCities = sessionStorage.getItem("hh_city_coords");

      if (cachedEvents && cachedCities) {
        if (mounted) {
          const parsedEvents = JSON.parse(cachedEvents).map((e: any) => ({
            ...e,
            parsedDateObj: e.parsedDateObj
              ? new Date(e.parsedDateObj)
              : undefined,
          }));
          setEvents(parsedEvents);
          setCityCoordinates(JSON.parse(cachedCities));
        }
        return;
      }

      try {
        // 2. Dynamic Import of Firestore SDK
        const { collection, getDocs } = await import("firebase/firestore");

        // 3. Parallel Fetching
        const [eventsSnapshot, citiesSnapshot] = await Promise.all([
          getDocs(collection(db, "userEvents")),
          getDocs(collection(db, "cities")),
        ]);

        // Process Events
        const fetchedEvents: Event[] = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          let parsedDateObj: Date | undefined = undefined;
          if (data.date && typeof data.date === "string") {
            const formats = ["MM/dd/yyyy", "yyyy-MM-dd", "MMMM d, yyyy"];
            for (const fmt of formats) {
              const parsed = parse(data.date, fmt, new Date());
              if (isValid(parsed)) {
                parsed.setHours(0, 0, 0, 0);
                parsedDateObj = parsed;
                break;
              }
            }
          }
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

        // Process Cities
        const citiesData: CityCoordinates = {};
        citiesSnapshot.docs.forEach((doc) => {
          const cityData = doc.data();
          citiesData[cityData.city] = {
            lat: cityData.coordinates.lat,
            lng: cityData.coordinates.lng,
          };
        });

        if (mounted) {
          setEvents(fetchedEvents);
          setCityCoordinates(citiesData);
          sessionStorage.setItem("hh_events", JSON.stringify(fetchedEvents));
          sessionStorage.setItem("hh_city_coords", JSON.stringify(citiesData));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => loadData());
    } else {
      setTimeout(loadData, 100);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Auth State
  useEffect(() => {
    let unsub: any;
    const timer = setTimeout(() => {
      unsub = onAuthStateChanged(auth, (user) => {
        setIsUserSignedIn(!!user);
      });
    }, 800);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, []);

  // Geolocation Handler
  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const closestCity = findClosestCity(latitude, longitude);
        if (closestCity) {
          const normalized = normalizeCityName(closestCity);
          setSelectedCity(normalized);
          setFilterCity(normalized);
          setSearchTerm(normalized);
          setDebouncedSearchTerm(normalized);

          sendDataLayerEvent("auto_locate", {
            event_category: "Geolocation",
            event_label: normalized,
          });
        } else {
          console.log("No supported cities found nearby.");
        }
      },
      (err) => {
        console.log("Geolocation denied or failed", err);
      },
    );
  }, [findClosestCity, normalizeCityName, sendDataLayerEvent]);

  // URL Params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get("searchTerm") || "";
    const city = urlParams.get("city");

    if (city) {
      setSelectedCity(city);
      setFilterCity(city);
    }

    if (queryTerm) setSearchTerm(queryTerm);
  }, [cityCoordinates]);

  // Update map location
  useEffect(() => {
    if (selectedCity && cityCoordinates[selectedCity]) {
      setMapLocation(cityCoordinates[selectedCity]);
    } else if (cityCoordinates["Spokane WA"]) {
      setMapLocation(cityCoordinates["Spokane WA"]);
    }
  }, [selectedCity, cityCoordinates]);

  // --- Computations ---

  const sortCitiesWithSpokaneFirst = useCallback((cities: string[]) => {
    return cities.sort((a, b) => {
      if (a === "Spokane WA") return -1;
      if (b === "Spokane WA") return 1;
      return a.localeCompare(b);
    });
  }, []);

  const allAvailableCities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => {
      if (event.location) {
        const parts = event.location.split(",");
        if (parts.length > 1) {
          set.add(normalizeCityName(parts[1].trim()));
        }
      }
    });
    return sortCitiesWithSpokaneFirst(Array.from(set));
  }, [events, normalizeCityName, sortCitiesWithSpokaneFirst]);

  const dropdownCities = useMemo(() => {
    if (!debouncedSearchTerm) return allAvailableCities;
    return allAvailableCities.filter((city) =>
      city.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [allAvailableCities, debouncedSearchTerm]);

  const eventsForMap = useMemo(() => {
    return events.filter((event) => isTabMatch(event));
  }, [events, isTabMatch]);

  // List filter logic
  const filteredEventsForView = useMemo(() => {
    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    const lowerSelectedCity = selectedCity.toLowerCase();

    return events.filter((event) => {
      const cityMatch =
        !selectedCity ||
        (event.location &&
          event.location.toLowerCase().includes(lowerSelectedCity));

      let dateMatch = false;
      if (event.isRecurring) {
        const dayMap: { [key: string]: number } = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };
        dateMatch = dayMap[event.date] === selectedDate.getDay();
      } else if (event.parsedDateObj) {
        dateMatch =
          event.parsedDateObj.getTime() === normalizedSelectedDate.getTime();
      }

      const searchMatch =
        !debouncedSearchTerm ||
        (event.name && event.name.toLowerCase().includes(lowerSearch)) ||
        (event.location && event.location.toLowerCase().includes(lowerSearch));

      return cityMatch && dateMatch && searchMatch && isTabMatch(event);
    });
  }, [events, selectedCity, selectedDate, debouncedSearchTerm, isTabMatch]);

  const sortedEventsByCity = useMemo(() => {
    let list = events;

    if (filterCity !== "All Cities") {
      list = list.filter(
        (e) =>
          e.location &&
          normalizeCityName(e.location.split(",")[1] || "").trim() ===
            filterCity,
      );
    }

    list = list.filter(isTabMatch);

    return list.sort((a, b) => {
      const aLoc = a.location || "";
      const bLoc = b.location || "";
      const aClub = aLoc.includes("Spokane Comedy Club");
      const bClub = bLoc.includes("Spokane Comedy Club");

      if (aClub && !bClub) return -1;
      if (!aClub && bClub) return 1;

      const tA = a.numericTimestamp || 0;
      const tB = b.numericTimestamp || 0;
      return tB - tA;
    });
  }, [events, filterCity, isTabMatch, normalizeCityName]);

  // --- Handlers ---

  const handleCitySelect = (city: string) => {
    const normalized = normalizeCityName(city);
    setSelectedCity(normalized);
    setFilterCity(normalized);
    setSearchTerm(normalized);
    setDebouncedSearchTerm(normalized);
    setIsFirstDropdownOpen(false);
    sendDataLayerEvent("select_city", {
      event_category: "City Selection",
      event_label: normalized,
    });
  };

  const handleCityFilterChange = (city: string) => {
    if (city === "All Cities") {
      setFilterCity(city);
      setSelectedCity("");
      setSearchTerm("");
      setDebouncedSearchTerm("");
    } else {
      const normalized = normalizeCityName(city);
      setFilterCity(normalized);
      setSelectedCity(normalized);
      setSearchTerm(normalized);
      setDebouncedSearchTerm(normalized);
    }
    setIsSecondDropdownOpen(false);
    sendDataLayerEvent("filter_city", {
      event_category: "City Filter",
      event_label: city,
    });
  };

  const handleEventSave = useCallback(
    async (event: Event) => {
      if (!isUserSignedIn)
        return alert("Please sign in to save events to your profile.");

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not found.");

        if (!event.id) throw new Error("Event ID missing.");

        const { doc, setDoc, collection } = await import("firebase/firestore");

        const { parsedDateObj, ...dataToSave } = event;

        const userSavedEventRef = doc(collection(db, "savedEvents"), event.id);
        await setDoc(userSavedEventRef, { ...dataToSave, userId: user.uid });

        alert("Event saved to your profile successfully!");
        sendDataLayerEvent("save_event", {
          event_category: "Event Interaction",
          event_label: event.name,
        });
      } catch (error) {
        console.error("Save failed:", error);
        alert("Oops! Something went wrong. Please try again.");
      }
    },
    [isUserSignedIn, sendDataLayerEvent],
  );

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => {
      const newVal = !prev;
      sendDataLayerEvent("toggle_map", {
        event_category: "Map Interaction",
        event_label: newVal ? "Show Map" : "Hide Map",
      });
      return newVal;
    });
  };

  const getFormattedDateForInput = (date: Date) => {
    return date.toLocaleDateString("en-CA");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
  };

  // --- Memoized UI Components ---

  const MemoizedGoogleMap = useMemo(() => {
    if (!mapLocation || !isMapVisible) return null;
    return (
      <Suspense
        fallback={
          <div className="h-[25rem] w-full bg-zinc-200 animate-pulse rounded-xl"></div>
        }
      >
        <GoogleMap
          lat={mapLocation.lat}
          lng={mapLocation.lng}
          events={eventsForMap}
        />
      </Suspense>
    );
  }, [mapLocation, isMapVisible, eventsForMap]);

  const MemoizedEventForm = React.memo(EventForm);

  const itemData = useMemo(
    () => ({
      events: sortedEventsByCity,
      onSave: handleEventSave,
    }),
    [sortedEventsByCity, handleEventSave],
  );

  return (
    <>
      <Header />
      <div className="screen-container content-with-sidebar">
        <div className="border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-md text-center mb-3 bg-zinc-200 text-xs sm:text-sm">
          <p className="m-0">
            <strong className="font-bold">📢 Note: </strong>
            Open mic events evolve quickly. See something outdated?{" "}
            <Link
              href="/contact"
              className="underline font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              Contact Us
            </Link>{" "}
            to let us know. Help keep the comedy community thriving!
          </p>
        </div>

        <h1 className="title font-bold text-center mb-6">MicFinder</h1>
        <h2 className="subtitle-style font-medium text-center mb-6">
          Discover Mics and Festivals Near You!
        </h2>
        <p className="text-center mt-4 mb-6">
          Share a mic or find your next one: MicFinder helps you discover and
          add comedy events to connect with your community and keep the laughs
          going!
        </p>
        <div className="text-center mb-4 h-16 w-full rounded-xl">
          <MemoizedEventForm />
        </div>
        <h3 className="text-md font-semibold text-center mt-4 sm:mt-2 mb-4 xs:mb-2">
          Find your next show or night out. Pick a city and date!
        </h3>
        {/* City Selection Dropdown */}
        <div className="flex flex-col justify-center items-center mt-2 relative z-20">
          <div className="relative w-full max-w-xs min-h-[60px]">
            <p id="city-select-label" className="sr-only">
              Select a City
            </p>
            <div
              id="city-select"
              aria-labelledby="city-select-label"
              tabIndex={0}
              className="modern-input cursor-pointer bg-zinc-200 text-zinc-900 flex items-center justify-center text-center px-3"
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
              <div className="w-full max-w-xs bg-zinc-100 shadow-md rounded-lg mt-1 absolute top-full left-0 max-h-[192px] overflow-y-auto z-30">
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full px-3 py-2 border-b bg-zinc-100 text-zinc-900 outline-none"
                  autoFocus
                />
                <ul className="text-zinc-900" role="listbox">
                  <li
                    className="px-4 py-3 cursor-pointer bg-green-50 hover:bg-green-100 text-center font-bold text-green-700 border-b border-zinc-200 flex justify-center items-center gap-2"
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
                      className="px-4 py-2 cursor-pointer hover:bg-zinc-200 text-center"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col justify-center items-center mt-2 w-full max-w-xs relative">
            <div className="relative w-full">
              <label htmlFor="event-date-picker" className="sr-only">
                Select Event Date
              </label>
              <input
                id="event-date-picker"
                type="date"
                value={getFormattedDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="modern-input w-full cursor-pointer text-center appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 90 90"
                fill="currentColor"
                className="h-5 w-5 text-zinc-900 absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none z-10"
              >
                <g>
                  <path d="M 90 23.452 v -3.892 c 0 -6.074 -4.942 -11.016 -11.017 -11.016 H 68.522 V 4.284 c 0 -1.657 -1.343 -3 -3 -3 s -3 1.343 -3 3 v 4.261 H 27.477 V 4.284 c 0 -1.657 -1.343 -3 -3 -3 s -3 1.343 -3 3 v 4.261 H 11.016 C 4.942 8.545 0 13.487 0 19.561 v 3.892 H 90 z" />
                  <path d="M 0 29.452 V 75.7 c 0 6.074 4.942 11.016 11.016 11.016 h 67.967 C 85.058 86.716 90 81.775 90 75.7 V 29.452 H 0 z M 25.779 72.18 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 72.18 25.779 72.18 z M 25.779 58.816 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 58.816 25.779 58.816 z M 25.779 45.452 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 45.452 25.779 45.452 z M 48.688 72.18 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 72.18 48.688 72.18 z M 48.688 58.816 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 58.816 48.688 58.816 z M 48.688 45.452 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 45.452 48.688 45.452 z M 71.597 72.18 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 72.18 71.597 72.18 z M 71.597 58.816 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 58.816 71.597 58.816 z M 71.597 45.452 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 45.452 71.597 45.452 z" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <section className="w-full h-[25rem] rounded-xl shadow-md relative border border-zinc-200 mt-6 overflow-hidden">
          {!isMapVisible ? (
            <div className="w-full h-full flex items-center justify-center">
              <button
                onClick={toggleMapVisibility}
                className="text-zinc-900 rounded-lg shadow-lg px-6 py-3 bg-green-400 transition cursor-pointer hover:bg-green-500 font-bold text-lg"
              >
                Show Map
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={toggleMapVisibility}
                className="absolute top-4 right-4 z-10 text-zinc-900 rounded-lg shadow-lg px-4 py-2 bg-white/90 hover:bg-white transition cursor-pointer font-semibold"
              >
                Hide Map
              </button>
              {MemoizedGoogleMap}
            </>
          )}
        </section>

        <p className="text-md text-center mb-2 sm:mb-1 xs:mb-1 mt-6">
          *Scroll through events to find your next Mic or Festival!*
        </p>

        {/* Top List */}
        <section className="card-style">
          <h2
            className="title-style text-center"
            style={{ borderBottom: "0.15rem solid #f97316" }}
          >
            {selectedTab === "Mics" && "Comedy Mics"}
            {selectedTab === "Festivals" && "Festivals"}
            {selectedTab === "Other" && "Music/All Arts"}
          </h2>

          {selectedCity === "" ? (
            <p className="text-center py-4">
              Please select a city above to see events.
            </p>
          ) : filteredEventsForView.length > 0 ? (
            filteredEventsForView.map((event) => (
              <div key={event.id} className="event-item mt-2">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="details-label">📅 Date: {event.date}</p>
                <p className="details-label">📍 Location: {event.location}</p>
                {event.festival && (
                  <p className="details-label text-purple-600 font-bold">
                    🏆 This is a festival!
                  </p>
                )}
                {event.isMusic && !event.festival && (
                  <p className="details-label text-green-600 font-bold">
                    🎶 This is a Music/Other event!
                  </p>
                )}
                <div className="details-label">
                  <span className="details-label">ℹ️ Details:</span>
                  <div dangerouslySetInnerHTML={{ __html: event.details }} />
                </div>
                <button
                  className="btn mt-1 mb-1 px-2 py-1"
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

        {/* Tab Buttons */}
        <div className="tab-container flex justify-center mt-4 gap-3">
          <button
            className={`tab-button font-bold px-4 py-2 rounded-full transition ${
              selectedTab === "Mics"
                ? "bg-blue-600 text-white ring-2 ring-white shadow-lg"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
            onClick={() => setSelectedTab("Mics")}
          >
            Comedy Mics
          </button>
          <button
            className={`tab-button font-bold px-4 py-2 rounded-full transition ${
              selectedTab === "Festivals"
                ? "bg-purple-700 text-white ring-2 ring-white shadow-lg"
                : "bg-purple-100 text-purple-800 hover:bg-purple-200"
            }`}
            onClick={() => setSelectedTab("Festivals")}
          >
            Festivals
          </button>
          <button
            className={`tab-button font-bold px-4 py-2 rounded-full transition ${
              selectedTab === "Other"
                ? "bg-green-600 text-white ring-2 ring-white shadow-lg"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            onClick={() => setSelectedTab("Other")}
          >
            Music/All arts
          </button>
        </div>

        {/* Bottom List */}
        <section className="card-style">
          <div className="flex flex-col justify-center items-center mt-2 relative z-10">
            <div className="relative w-full max-w-xs">
              <label htmlFor="city-filter-select" className="sr-only">
                Filter by City
              </label>
              <div
                id="city-filter-select"
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
                <div className="absolute top-full left-0 right-0 z-30 bg-zinc-100 shadow-md rounded-lg mt-1 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="w-full px-3 py-2 border-b bg-zinc-100 text-zinc-900 outline-none"
                    autoFocus
                  />
                  <ul
                    className="max-h-48 overflow-y-auto text-zinc-900"
                    role="listbox"
                  >
                    <li
                      role="option"
                      aria-selected={filterCity === "All Cities"}
                      className={`px-4 py-2 cursor-pointer hover:bg-zinc-200 text-center ${
                        filterCity === "All Cities"
                          ? "bg-zinc-200 font-semibold"
                          : ""
                      }`}
                      onClick={() => handleCityFilterChange("All Cities")}
                    >
                      All Cities
                    </li>
                    {dropdownCities.map((city) => (
                      <li
                        key={city}
                        role="option"
                        aria-selected={filterCity === city}
                        className={`px-4 py-2 cursor-pointer hover:bg-zinc-200 text-center ${
                          filterCity === city ? "bg-zinc-200 font-semibold" : ""
                        }`}
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

          <h2 className="title-style text-center mt-4">
            {filterCity === "All Cities"
              ? `All ${
                  selectedTab === "Mics"
                    ? "Mics"
                    : selectedTab === "Festivals"
                    ? "Festivals"
                    : "Arts"
                }`
              : `All ${
                  selectedTab === "Mics"
                    ? "Mics"
                    : selectedTab === "Festivals"
                    ? "Festivals"
                    : "Arts"
                } in ${filterCity}`}
          </h2>

          {sortedEventsByCity.length === 0 && (
            <p className="text-center py-4">
              No events found for {filterCity}.
            </p>
          )}

          <List
            height={600}
            itemCount={sortedEventsByCity.length}
            itemSize={385}
            width="100%"
            itemData={itemData}
          >
            {Row}
          </List>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default EventsPage;
