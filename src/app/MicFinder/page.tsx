"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import "react-datepicker/dist/react-datepicker.css";
import dynamic from "next/dynamic";
import { app, db, auth } from "../../../firebase.config";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FixedSizeList as List } from "react-window";
import Head from "next/head";
import Script from "next/script";
import { parse, isValid } from "date-fns";
import ReactDatePicker from "react-datepicker";

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (value: number) => (value * Math.PI) / 180; // Degrees to radians

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Header = dynamic(() => import("../components/header"), {});

const Footer = dynamic(() => import("../components/footer"), {});

const GoogleMap = dynamic(() => import("../components/GoogleMap"), {
  loading: () => <p>Loading map...</p>,
  ssr: false,
});

const EventForm = dynamic(() => import("../components/EventForm"), {
  loading: () => <p>Loading form...</p>,
  ssr: false,
});

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
};

type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

const EventsPage = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<ReactDatePicker | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("All Cities");
  const [loadedItems, setLoadedItems] = useState(5);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [cityCoordinates, setCityCoordinates] = useState<CityCoordinates>({});
  const [isFirstDropdownOpen, setIsFirstDropdownOpen] = useState(false);
  const [isSecondDropdownOpen, setIsSecondDropdownOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<"Mics" | "Festivals">("Mics"); // State to track selected tab

  // Function to find the closest city in the database
  const findClosestCity = useCallback(
    (latitude: number, longitude: number): string | null => {
      if (Object.keys(cityCoordinates).length === 0) {
        return null;
      }

      let closestCity: string | null = null;
      let minDistance = Infinity;

      for (const [city, coords] of Object.entries(cityCoordinates)) {
        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          coords.lat,
          coords.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }

      return closestCity;
    },
    [cityCoordinates]
  );

  const searchTimeoutRef = useRef<number | null>(null);

  function sendDataLayerEvent(
    event_name: string,
    params: { event_category: string; event_label: string }
  ) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: event_name,
      ...params,
    });
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Debounce the search event
    if (searchTimeoutRef.current !== null) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      sendDataLayerEvent("search_city", {
        event_category: "City Search",
        event_label: term,
      });
    }, 500); // Delay of 500ms
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    const normalizedCity = normalizeCityName(city);
    setSelectedCity(normalizedCity);
    setFilterCity(normalizedCity);
    setSearchTerm(normalizedCity);

    // Send event to dataLayer
    sendDataLayerEvent("select_city", {
      event_category: "City Selection",
      event_label: normalizedCity,
    });
  };

  const eventsForMap = useMemo(() => {
    let filteredEvents = events;

    // Simplified festival filtering based on selectedTab
    const isFestivalMatch = (event: Event) =>
      selectedTab === "Festivals" ? event.festival : !event.festival;

    filteredEvents = filteredEvents.filter(isFestivalMatch);

    return filteredEvents;
  }, [events, selectedTab]);

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => {
      const newValue = !prev;

      // Send event to dataLayer
      sendDataLayerEvent("toggle_map", {
        event_category: "Map Interaction",
        event_label: newValue ? "Show Map" : "Hide Map",
      });

      return newValue;
    });
  };

  useEffect(() => {
    if (selectedCity && cityCoordinates[selectedCity]) {
      setMapLocation(cityCoordinates[selectedCity]);
    }
  }, [selectedCity, cityCoordinates]);

  const handleOnItemsRendered = ({
    overscanStopIndex,
  }: {
    overscanStopIndex: number;
  }) => {
    if (
      overscanStopIndex >= loadedItems - 1 &&
      loadedItems < eventsByCity.length
    ) {
      setLoadedItems((prev) => Math.min(prev + 5, eventsByCity.length));
    }
  };

  const normalizeCityName = useCallback((name: string) => name.trim(), []);

  const handleCityFilterChange = (city: string) => {
    if (city === "All Cities") {
      setFilterCity(city);
      setSelectedCity("");
      setSearchTerm("");
    } else {
      const normalizedCity = normalizeCityName(city);
      setFilterCity(normalizedCity);
      setSelectedCity(normalizedCity);
      setSearchTerm(normalizedCity);
    }
    setIsSecondDropdownOpen(false);

    // Send event to dataLayer
    sendDataLayerEvent("filter_city", {
      event_category: "City Filter",
      event_label: city,
    });
  };

  const eventsByCity = useMemo(() => {
    let filteredEvents = events;

    if (filterCity !== "All Cities") {
      const normalizedFilterCity = normalizeCityName(filterCity);
      filteredEvents = filteredEvents.filter((event) => {
        const location = event.location;
        if (location && typeof location === "string") {
          const locationParts = location.split(",");
          return (
            locationParts.length > 1 &&
            normalizeCityName(locationParts[1].trim()) === normalizedFilterCity
          );
        }
        return false;
      });
    }

    // Simplified festival filtering based on selectedTab
    const isFestivalMatch = (event: Event) =>
      selectedTab === "Festivals" ? event.festival : !event.festival;

    filteredEvents = filteredEvents.filter(isFestivalMatch);

    return filteredEvents;
  }, [filterCity, events, normalizeCityName, selectedTab]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "userEvents"));
        const fetchedEvents: Event[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          const festival = data.festival === true;

          return {
            ...data,
            festival,
          } as Event;
        });
        setEvents(fetchedEvents);
      } catch (error) {
        alert(
          "Oops! We couldn't load the events at the moment. Please try again later."
        );
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const db = getFirestore(app);
        const citiesSnapshot = await getDocs(collection(db, "cities"));
        const citiesData: CityCoordinates = {};

        citiesSnapshot.docs.forEach((doc) => {
          const cityData = doc.data();
          const city = cityData.city; // "City State" format
          citiesData[city] = {
            lat: cityData.coordinates.lat,
            lng: cityData.coordinates.lng,
          };
        });

        setCityCoordinates(citiesData);
      } catch (error) {
        // Handle error if necessary
      }
    };

    fetchCities();
  }, []);

  const isRecurringEvent = useCallback(
    (eventDate: string, selectedDate: Date): boolean => {
      const dayOfWeekMap: { [key: string]: number } = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const eventDay = dayOfWeekMap[eventDate];
      const selectedDay = selectedDate.getDay();

      return eventDay === selectedDay;
    },
    []
  );

  const filteredEvents = useMemo(() => {
    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);

    const lowercasedSearchTerm = searchTerm ? searchTerm.toLowerCase() : null;
    const lowercasedSelectedCity = selectedCity
      ? selectedCity.toLowerCase()
      : "";

    return events.filter((event) => {
      const isInSelectedCity =
        !lowercasedSelectedCity ||
        (event.location &&
          event.location.toLowerCase().includes(lowercasedSelectedCity));

      let isOnSelectedDate = true;
      if (event.isRecurring) {
        isOnSelectedDate = isRecurringEvent(event.date, selectedDate);
      } else {
        if (event.date && typeof event.date === "string") {
          let eventDate: Date | undefined = undefined;
          const dateFormats = ["MM/dd/yyyy", "yyyy-MM-dd", "MMMM d, yyyy"];

          for (let format of dateFormats) {
            const parsedDate = parse(event.date, format, new Date());
            if (isValid(parsedDate)) {
              eventDate = parsedDate;
              break;
            }
          }

          if (!eventDate) {
            isOnSelectedDate = false;
          } else {
            eventDate.setHours(0, 0, 0, 0);
            isOnSelectedDate =
              eventDate.getTime() === normalizedSelectedDate.getTime();
          }
        } else {
          isOnSelectedDate = false;
        }
      }

      const matchesSearchTerm = lowercasedSearchTerm
        ? (event.name &&
            event.name.toLowerCase().includes(lowercasedSearchTerm)) ||
          (event.location &&
            event.location.toLowerCase().includes(lowercasedSearchTerm))
        : true;

      const isFestivalMatch =
        selectedTab === "Festivals" ? event.festival : !event.festival;

      return (
        isInSelectedCity &&
        isOnSelectedDate &&
        matchesSearchTerm &&
        isFestivalMatch
      );
    });
  }, [
    events,
    selectedCity,
    selectedDate,
    isRecurringEvent,
    searchTerm,
    selectedTab,
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });

    return unsubscribe;
  }, []);

  const handleEventSave = useCallback(
    async (event: Event) => {
      if (!isUserSignedIn) {
        alert("Please sign in to save events to your profile.");
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not found.");
        }

        // Create a reference to the user's savedEvents collection
        const userSavedEventRef = doc(collection(db, "savedEvents"), event.id);
        await setDoc(userSavedEventRef, { ...event, userId: user.uid });

        alert("Event saved to your profile successfully!");
      } catch (error) {
        alert(
          "Oops! Something went wrong while saving the event. Please try again."
        );
      }

      sendDataLayerEvent("save_event", {
        event_category: "Event Interaction",
        event_label: event.name,
      });
    },
    [isUserSignedIn]
  );

  // Create a function to sort cities with Spokane WA first
  const sortCitiesWithSpokaneFirst = (cities: string[]): string[] => {
    return cities.sort((a, b) => {
      if (a === "Spokane WA") return -1;
      if (b === "Spokane WA") return 1;
      return a.localeCompare(b);
    });
  };

  const uniqueCities = useMemo(() => {
    const citySet = new Set<string>();
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    events.forEach((event) => {
      if (event.location) {
        const parts = event.location.split(", ");
        if (parts.length > 1) {
          const normalizedCity = normalizeCityName(parts[1].trim());
          if (normalizedCity.toLowerCase().includes(lowercasedSearchTerm)) {
            citySet.add(normalizedCity);
          }
        }
      }
    });

    // Convert set to array and apply sorting with Spokane at the top
    return sortCitiesWithSpokaneFirst(Array.from(citySet));
  }, [events, searchTerm, normalizeCityName]);

  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported. Please select a city manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const closestCity = findClosestCity(latitude, longitude);

          if (closestCity) {
            setSelectedCity(closestCity);
            setFilterCity(closestCity);
          } else {
            alert("No nearby cities found. Please select a city manually.");
          }
        } catch (error) {
          // Handle error if necessary
        }
      },
      (error) => {
        alert(
          "Unable to retrieve your location. Please select a city manually."
        );
      }
    );
  }, [findClosestCity]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get("searchTerm") || "";
    const city = urlParams.get("city");

    if (city) {
      setSelectedCity(city);
      setFilterCity(city);
    } else if (Object.keys(cityCoordinates).length > 0) {
      fetchUserLocation();
    }

    setSearchTerm(queryTerm);
  }, [fetchUserLocation, cityCoordinates]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setIsDatePickerOpen(false);
    }
  };

  const openDatePicker = () => {
    setIsDatePickerOpen((prev) => !prev);
  };

  const selectedCityCoordinates = useMemo(() => {
    return cityCoordinates[selectedCity] || cityCoordinates["Spokane WA"];
  }, [selectedCity, cityCoordinates]);

  useEffect(() => {
    if (selectedCityCoordinates) {
      setMapLocation(selectedCityCoordinates);
    }
  }, [selectedCityCoordinates]);

  const MemoizedGoogleMap = useMemo(() => {
    return mapLocation && isMapVisible ? (
      <Suspense fallback={<p>Loading map...</p>}>
        <GoogleMap
          lat={mapLocation.lat}
          lng={mapLocation.lng}
          events={eventsForMap} // Use eventsForMap here
        />
      </Suspense>
    ) : null;
  }, [mapLocation, isMapVisible, eventsForMap]); // Add eventsForMap to dependencies

  const MemoizedEventForm = React.memo(EventForm);

  const sortedEventsByCity = useMemo(() => {
    const spokaneClubFirst = (a: Event, b: Event) => {
      const aLoc = a?.location || "";
      const bLoc = b?.location || "";

      if (aLoc.includes("Spokane Comedy Club")) return -1;
      if (bLoc.includes("Spokane Comedy Club")) return 1;
      return 0;
    };

    const sortedEvents = [...eventsByCity].sort(
      (a, b) =>
        spokaneClubFirst(a, b) ||
        new Date(b.googleTimestamp).getTime() -
          new Date(a.googleTimestamp).getTime()
    );

    return sortedEvents;
  }, [eventsByCity]);

  // OpenMicBanner component with visibility timeout
  const OpenMicBanner = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000); // Hide banner after 10 seconds

      return () => clearTimeout(timer); // Cleanup the timeout
    }, []);

    if (!visible) return null;

    return (
      <div className="border border-red-400 text-red-500 px-2 py-1 rounded-xl shadow-xl relative text-center mb-4">
        <strong className="font-bold">📢 Note: </strong>
        <span className="block sm:inline">
          Keep in mind, events can change frequently in the open mic scene.
          We&apos;re now adding comedy festivals—reach out to get yours featured
          and keep the community laughing!
        </span>

        <span
          className="absolute top-[-0.75rem] right-[-0.75rem] px-4 py-3 cursor-pointer"
          onClick={() => setVisible(false)}
        >
          <svg
            className="fill-current h-6 w-6 text-zinc-200"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.641 3.641a.5.5 0 11-.707.707L10 10.707l-3.641 3.641a.5.5 0 11-.707-.707L9.293 10 5.652 6.359a.5.5 0 01.707-.707L10 9.293l3.641-3.641a.5.5 0 01.707 0z" />
          </svg>
        </span>
      </div>
    );
  };

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const event = sortedEventsByCity[index];
    return (
      <div style={style}>
        <div key={event.id} className="event-item mt-2">
          <h3 className="text-lg font-semibold">{event.name}</h3>
          <p className="details-label">📅 Date: {event.date}</p>
          <p className="details-label">📍 Location: {event.location}</p>
          {event.festival && (
            <p className="details-label">🏆 This is a festival!</p>
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
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>
          MicFinder - Your Comedy HQ: Open Mics, Shows & Festivals Near You
        </title>
        <meta
          name="description"
          content="Jump into the local comedy scene with MicFinder! Whether you're cracking jokes or just soaking them up, find the best open mics, shows, and festivals in your area."
        />

        <meta
          name="keywords"
          content="MicFinder, comedy events, stand-up comedy, open mic near me, local mics, comedy festivals, comedy nights, live comedy shows, comedy, jokes, mics"
        />

        <link rel="canonical" href="https://www.thehumorhub.com/MicFinder" />

        <meta
          property="og:title"
          content="MicFinder - Your Go-To Tool for Finding Open Mics and Comedy Festivals"
        />
        <meta
          property="og:description"
          content="Locate the top open mic nights, stand-up comedy shows, and festivals in your region with MicFinder. Perfect for comedians and fans seeking local events."
        />
        <meta
          property="og:url"
          content="https://www.thehumorhub.com/MicFinder"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/micfinder.webp"
        />
      </Head>
      <Script
        strategy="lazyOnload"
        src="https://www.googletagmanager.com/gtag/js?id=G-WH6KKVYT8F"
      />
      <Header />
      <div className="screen-container content-with-sidebar">
        <OpenMicBanner />
        <h1 className="title font-bold text-center mb-6">
          Discover Mics and Festivals Near You!
        </h1>

        <p className="text-center mt-4 mb-6">
          Got a mic to share or ready to find your next mic? MicFinder is your
          go-to for discovering and adding comedy events—connect with your
          community and keep the laughs going!
        </p>

        <div className="text-center mb-8">
          <MemoizedEventForm />
        </div>

        <h2 className="text-md font-semibold text-center mt-4 sm:mt-2 mb-4 xs:mb-2">
          Find your next show or next night out—pick a city and date!
        </h2>

        <p className="text-sm text-center mb-4 sm:mb-2 xs:mb-1">
          Dive in and scroll through upcoming events to find your next big gig
          or a night of laughter.
        </p>

        <div className="flex flex-col justify-center items-center mt-2">
          <div className="relative w-full max-w-xs min-h-[60px]">
            <div
              className="modern-input cursor-pointer bg-zinc-100 text-zinc-900"
              onClick={() => {
                setIsFirstDropdownOpen((prev) => {
                  const newValue = !prev;

                  // Send event when dropdown is opened
                  if (newValue) {
                    sendDataLayerEvent("open_dropdown", {
                      event_category: "Dropdown",
                      event_label: "City Selection Dropdown",
                    });
                  }

                  return newValue;
                });
                setIsSecondDropdownOpen(false);
              }}
            >
              {selectedCity || "Select a City"}
            </div>

            {/* Dropdown menu */}
            {isFirstDropdownOpen && (
              <div className="w-full max-w-xs bg-zinc-100 shadow-md rounded-lg mt-1 max-h-[192px] overflow-y-auto">
                {/* Search input inside the dropdown */}
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full px-3 py-2 border-b bg-zinc-100 text-zinc-900 rounded-xl shadow-xl"
                />

                {/* Filtered city options */}
                <ul className="max-h-48 overflow-y-auto bg-zinc-100 text-zinc-900">
                  {sortCitiesWithSpokaneFirst(
                    Object.keys(cityCoordinates).filter((city) =>
                      city.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  ).map((city) => (
                    <li
                      key={city}
                      className="px-4 py-2 cursor-pointer hover:bg-zinc-200 rounded-xl shadow-xl"
                      onClick={() => {
                        handleCitySelect(city);
                        setIsFirstDropdownOpen(false);

                        // Send event to dataLayer
                        sendDataLayerEvent("click_city_option", {
                          event_category: "City Selection",
                          event_label: city,
                        });
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col justify-center items-center mt-2">
            <div className="relative w-full max-w-xs min-h-[60px]">
              <ReactDatePicker
                ref={datePickerRef}
                selected={selectedDate}
                onChange={handleDateChange}
                onFocus={openDatePicker}
                open={isDatePickerOpen}
                onClickOutside={() => setIsDatePickerOpen(false)}
                onSelect={() => setIsDatePickerOpen(false)}
                className="modern-input w-full cursor-pointer"
                aria-label="Select date"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 90 90"
                fill="currentColor"
                className="h-5 w-5 text-zinc-900 absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                aria-hidden="true"
              >
                <g>
                  <path d="M 90 23.452 v -3.892 c 0 -6.074 -4.942 -11.016 -11.017 -11.016 H 68.522 V 4.284 c 0 -1.657 -1.343 -3 -3 -3 s -3 1.343 -3 3 v 4.261 H 27.477 V 4.284 c 0 -1.657 -1.343 -3 -3 -3 s -3 1.343 -3 3 v 4.261 H 11.016 C 4.942 8.545 0 13.487 0 19.561 v 3.892 H 90 z" />
                  <path d="M 0 29.452 V 75.7 c 0 6.074 4.942 11.016 11.016 11.016 h 67.967 C 85.058 86.716 90 81.775 90 75.7 V 29.452 H 0 z M 25.779 72.18 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 72.18 25.779 72.18 z M 25.779 58.816 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 58.816 25.779 58.816 z M 25.779 45.452 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 45.452 25.779 45.452 z M 48.688 72.18 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 72.18 48.688 72.18 z M 48.688 58.816 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 58.816 48.688 58.816 z M 48.688 45.452 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 45.452 48.688 45.452 z M 71.597 72.18 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 72.18 71.597 72.18 z M 71.597 58.816 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 58.816 71.597 58.816 z M 71.597 45.452 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 45.452 71.597 45.452 z" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <section className="card-style1">
          <button
            onClick={toggleMapVisibility}
            className="mb-4 text-zinc-100 rounded-lg shadow-lg px-4 py-2 bg-green-500 transition cursor-pointer"
          >
            {isMapVisible ? "Hide Map" : "Show Map"}
          </button>
          {MemoizedGoogleMap}
        </section>

        {/* Event List */}
        <section className="card-style">
          <h2
            className="title-style text-center"
            style={{ borderBottom: "0.15rem solid #f97316" }}
          >
            {selectedTab === "Mics" ? "Open Mics" : "Festivals"}
          </h2>
          {selectedCity === "" ? (
            <p>Please select a city to see events.</p>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="event-item mt-2">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="details-label">📅 Date: {event.date}</p>
                <p className="details-label">📍 Location: {event.location}</p>
                {event.festival && (
                  <p className="details-label">🏆 This is a festival!</p>
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
            <p>
              {selectedTab === "Mics"
                ? `No daily events found for ${
                    selectedCity || "the selected city"
                  } on ${selectedDate.toLocaleDateString()}.`
                : `No festivals found for ${
                    selectedCity || "the selected city"
                  } on ${selectedDate.toLocaleDateString()}`}
            </p>
          )}
        </section>
        {/* Tab Buttons */}
        <div className="tab-container flex justify-center mt-4">
          <button
            className={`tab-button ${
              selectedTab === "Mics"
                ? "tab-button-active"
                : "tab-button-inactive"
            }`}
            onClick={() => setSelectedTab("Mics")}
            aria-label="Show Open Mic Events"
          >
            Mics
          </button>
          <button
            className={`tab-button ${
              selectedTab === "Mics"
                ? "tab-button-inactive"
                : "tab-button-active"
            }`}
            onClick={() => setSelectedTab("Festivals")}
            aria-label="Show Festival Events"
          >
            Festivals
          </button>
        </div>

        {/* All Events List */}
        <section className="card-style">
          <div className="flex flex-col justify-center items-center mt-2">
            {/* Dropdown with search input */}
            <div className="relative w-full max-w-xs">
              {/* Button to open/close dropdown */}
              <div
                className="modern-input cursor-pointer bg-zinc-100 text-zinc-900"
                onClick={() => {
                  setIsSecondDropdownOpen((prev) => {
                    const newValue = !prev;

                    // Send event when dropdown is opened
                    if (newValue) {
                      sendDataLayerEvent("open_dropdown", {
                        event_category: "Dropdown",
                        event_label: "City Filter Dropdown",
                      });
                    }

                    return newValue;
                  });
                  setIsFirstDropdownOpen(false);
                }}
              >
                {filterCity || "All Cities"}
              </div>

              {/* Dropdown menu */}
              {isSecondDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-10 bg-zinc-100 shadow-md rounded-lg mt-1">
                  {/* Search input inside the dropdown */}
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border-b bg-zinc-100 text-zinc-900 rounded-xl shadow-xl"
                  />

                  {/* Filtered city options */}
                  <ul className="max-h-48 overflow-y-auto bg-zinc-100 text-zinc-900">
                    <li
                      key="All Cities"
                      className="px-4 py-2 cursor-pointer hover:bg-zinc-200 rounded-xl shadow-xl"
                      onClick={() => {
                        handleCityFilterChange("All Cities");
                        setIsSecondDropdownOpen(false);

                        // Send event to dataLayer
                        sendDataLayerEvent("click_city_filter_option", {
                          event_category: "City Filter",
                          event_label: "All Cities",
                        });
                      }}
                    >
                      All Cities
                    </li>

                    {sortCitiesWithSpokaneFirst(
                      uniqueCities.filter((city) =>
                        city.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    ).map((city) => (
                      <li
                        key={city}
                        className="px-4 py-2 cursor-pointer hover:bg-zinc-200 rounded-xl shadow-xl"
                        onClick={() => {
                          handleCityFilterChange(city);
                          setIsSecondDropdownOpen(false);

                          // Send event to dataLayer
                          sendDataLayerEvent("click_city_filter_option", {
                            event_category: "City Filter",
                            event_label: city,
                          });
                        }}
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
              ? selectedTab === "Mics"
                ? "All Mics"
                : "All Festivals"
              : selectedTab === "Mics"
              ? `All Mics in ${filterCity}`
              : `All Festivals in ${filterCity}`}
          </h2>
          {selectedTab === "Festivals" && sortedEventsByCity.length === 0 && (
            <p>No festivals found for {filterCity}.</p>
          )}

          <List
            height={600}
            itemCount={sortedEventsByCity.length}
            itemSize={385}
            width="100%"
            onItemsRendered={handleOnItemsRendered}
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
