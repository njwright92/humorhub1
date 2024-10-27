"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { EventContext } from "../components/eventContext";
import dynamic from "next/dynamic";
import { app, db, auth } from "../../../firebase.config";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Header from "../components/header";
import Footer from "../components/footer";
import { onAuthStateChanged } from "firebase/auth";
import { FixedSizeList as List } from "react-window";
import Head from "next/head";
// import { getLatLng } from "../utils/geocode";
import Script from "next/script";
import ReactDatePicker from "react-datepicker";
// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180; // Convert degrees to radians
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

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
  const { saveEvent } = useContext(EventContext);
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

  // Function to find the closest city in the database
  const findClosestCity = useCallback(
    (latitude: number, longitude: number): string | null => {
      if (Object.keys(cityCoordinates).length === 0) {
        console.error("City coordinates not loaded yet.");
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
    [cityCoordinates] // Dependency array includes cityCoordinates
  );

  // Refactored Code with Highlights
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
  // Refactored toggleMapVisibility - Simplified the toggle function
  // Toggle map visibility with tracking
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

  // Refactored useEffect to avoid unnecessary database reads
  useEffect(() => {
    if (selectedCity && cityCoordinates[selectedCity]) {
      setMapLocation(cityCoordinates[selectedCity]);
    }
  }, [selectedCity, cityCoordinates]);

  // Refactored handleOnItemsRendered to avoid unnecessary state updates
  const handleOnItemsRendered = ({
    overscanStopIndex,
  }: {
    overscanStopIndex: number;
  }) => {
    if (
      overscanStopIndex >= loadedItems - 1 &&
      loadedItems < eventsByCity.length
    ) {
      setLoadedItems((prev) => Math.min(prev + 5, eventsByCity.length)); // Avoid setting state when all items are loaded
    }
  };

  // Refactored normalizeCityName - No changes, kept useCallback
  const normalizeCityName = useCallback((name: string) => name.trim(), []);

  // Refactored handleCityFilterChange - Simplified normalization logic
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

  // Refactored eventsByCity - Optimized filtering logic to avoid re-splitting and re-normalizing
  const eventsByCity = useMemo(() => {
    if (filterCity === "All Cities") {
      return events;
    }

    const normalizedFilterCity = normalizeCityName(filterCity);

    return events.filter((event) => {
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
  }, [filterCity, events, normalizeCityName]); // Add normalizeCityName here

  // Refactored useEffect to fetchEvents - Reduced unnecessary operations and improved error handling
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "userEvents"));
        const fetchedEvents: Event[] = querySnapshot.docs.map(
          (doc) => doc.data() as Event
        ); // Use map to collect events in one step
        setEvents(fetchedEvents); // Set state once after all data is collected
      } catch (error) {
        console.error("Error fetching events:", error); // Log the error for better debugging
        alert(
          "Oops! We couldn't load the events at the moment. Please try again later."
        );
      }
    };

    fetchEvents();
  }, []);

  // Refactored useEffect to fetchCities - Optimized data fetching and error handling
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const db = getFirestore(app);
        const citiesSnapshot = await getDocs(collection(db, "cities"));
        const citiesData: CityCoordinates = {};

        // Use map to populate citiesData in a cleaner, more efficient way
        citiesSnapshot.docs.forEach((doc) => {
          const cityData = doc.data();
          const city = cityData.city; // "City State" format, directly usable
          citiesData[city] = {
            lat: cityData.coordinates.lat,
            lng: cityData.coordinates.lng,
          };
        });

        setCityCoordinates(citiesData); // Set state only once with all data
      } catch (error) {
        console.error("Error fetching city data:", error); // Log error for better debugging
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

      return eventDay === selectedDay; // Simplified logic, no need for additional checks
    },
    []
  );

  // Refactored filteredEvents - Optimized filtering logic for performance
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
          event.location.toLowerCase().includes(lowercasedSelectedCity)); // Normalize city match

      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const isOnSelectedDate = event.isRecurring
        ? isRecurringEvent(event.date, selectedDate)
        : eventDate.getTime() === normalizedSelectedDate.getTime(); // Direct comparison of timestamps

      const matchesSearchTerm = lowercasedSearchTerm
        ? (event.name &&
            event.name.toLowerCase().includes(lowercasedSearchTerm)) ||
          (event.location &&
            event.location.toLowerCase().includes(lowercasedSearchTerm))
        : true;

      return isInSelectedCity && isOnSelectedDate && matchesSearchTerm;
    });
  }, [events, selectedCity, selectedDate, isRecurringEvent, searchTerm]);

  // Refactored useEffect for auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user); // Set user signed-in status
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  // Refactored handleEventSave - Improved alert logic and error handling
  const handleEventSave = useCallback(
    async (event: Event) => {
      if (!isUserSignedIn) {
        alert("Please sign in to save events to your profile.");
        return;
      }

      try {
        await saveEvent(event);
        alert("Event saved to your profile successfully!"); // Show success message only on successful save
      } catch (error) {
        console.error("Error saving event:", error); // Log error for better debugging
        alert(
          "Oops! Something went wrong while saving the event. Please try again."
        );
      }
      sendDataLayerEvent("save_event", {
        event_category: "Event Interaction",
        event_label: event.name,
      });
    },
    [saveEvent, isUserSignedIn]
  );

  const uniqueCities = useMemo(() => {
    const citySet = new Set<string>();
    const lowercasedSearchTerm = searchTerm.toLowerCase(); // Precompute the lowercased search term once

    events.forEach((event) => {
      if (event.location) {
        const parts = event.location.split(", "); // Split once, reuse for the check
        if (parts.length > 1) {
          const normalizedCity = normalizeCityName(parts[1].trim());
          if (normalizedCity.toLowerCase().includes(lowercasedSearchTerm)) {
            // Use precomputed search term
            citySet.add(normalizedCity);
          }
        }
      }
    });

    return Array.from(citySet).sort((a, b) => a.localeCompare(b)); // Sort the unique cities alphabetically
  }, [events, searchTerm, normalizeCityName]);

  // Type definition for location response
  // type LocationResponse = {
  //   city?: string;
  //   state?: string;
  // };

  // Refactored fetchCityFromCoordinates - Streamlined return logic
  // const fetchCityFromCoordinates = useCallback(
  //   async (latitude: number, longitude: number): Promise<string | null> => {
  //     try {
  //       const response = (await getLatLng(
  //         undefined,
  //         latitude,
  //         longitude
  //       )) as LocationResponse;

  //       // Return formatted city and state if both are present, otherwise return null
  //       return response.city && response.state
  //         ? `${response.city} ${response.state}`
  //         : null;
  //     } catch (error) {
  //       console.error("Error fetching city and state:", error);
  //       return null;
  //     }
  //   },
  //   [] // No dependencies
  // );

  // Refactored fetchUserLocation - Now uses findClosestCity
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
            console.error("Closest city could not be determined.");
            alert("No nearby cities found. Please select a city manually.");
          }
        } catch (error) {
          console.error("Error processing location:", error);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert(
          "Unable to retrieve your location. Please select a city manually."
        );
      }
    );
  }, [findClosestCity]); // Dependency array includes findClosestCity

  // Refactored useEffect for handling URL parameters and geolocation
  // useEffect that handles URL query parameters and fetches geolocation if necessary
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get("searchTerm") || "";
    const city = urlParams.get("city");

    if (city) {
      setSelectedCity(city);
      setFilterCity(city);
    } else if (Object.keys(cityCoordinates).length > 0) {
      fetchUserLocation(); // Fetch geolocation only if no city is provided and cityCoordinates are loaded
    }

    setSearchTerm(queryTerm);
  }, [fetchUserLocation, cityCoordinates]); // Added cityCoordinates to dependency array

  // Refactored handleDateChange - Simplified condition
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date); // Update selected date
      setIsDatePickerOpen(false); // Close date picker after selecting a date
    }
  };
  const openDatePicker = () => {
    setIsDatePickerOpen((prev) => !prev); // Toggle state to open/close the calendar
  };

  // Memoized selected city coordinates, with default to "Spokane WA"
  const selectedCityCoordinates = useMemo(() => {
    return cityCoordinates[selectedCity] || cityCoordinates["Spokane WA"];
  }, [selectedCity, cityCoordinates]);

  // Update map location only when selectedCityCoordinates changes
  useEffect(() => {
    if (selectedCityCoordinates) {
      setMapLocation(selectedCityCoordinates);
    }
  }, [selectedCityCoordinates]);

  // Memoized Google Map - Only renders when mapLocation and isMapVisible are true
  const MemoizedGoogleMap = useMemo(() => {
    return mapLocation && isMapVisible ? (
      <GoogleMap lat={mapLocation.lat} lng={mapLocation.lng} events={events} />
    ) : null;
  }, [mapLocation, isMapVisible, events]);

  // Memoize EventForm to prevent unnecessary re-renders
  const MemoizedEventForm = React.memo(EventForm);

  // Memoized sorted events by city to avoid unnecessary sorting on every render
  const sortedEventsByCity = useMemo(() => {
    return eventsByCity.sort(
      (a, b) =>
        new Date(b.googleTimestamp).getTime() -
        new Date(a.googleTimestamp).getTime()
    );
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
      <div className=" border border-red-400 text-red-500 px-4 py-3 rounded-xl shadow-xl relative text-center mb-4">
        <strong className="font-bold">Note:</strong>
        <span className="block sm:inline">
          I do my best to keep the events current, but with the constant
          changing landscape of open mics, they&apos;re not always up to date.
        </span>
        <span
          className="absolute top-[-0.5rem] right-[-0.5rem] px-4 py-3 cursor-pointer"
          onClick={() => setVisible(false)}
        >
          <svg
            className="fill-current h-6 w-6 text-red-500"
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
        <title>MicFinder - Locate Open Mic Events Near You</title>
        <meta
          name="description"
          content="Find the best open mic events in your area with MicFinder. Whether you're a comedian or an audience member, we've got you covered."
        />
        <meta
          name="keywords"
          content="MicFinder, open mic, comedy events, find open mics, comedy shows"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/MicFinder" />

        <meta
          property="og:title"
          content="MicFinder - Locate Open Mic Events Near You"
        />
        <meta
          property="og:description"
          content="Find the best open mic events in your area with MicFinder. Whether you're a comedian or an audience member, we've got you covered."
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
      <div className="screen-container">
        <OpenMicBanner />
        <h1 className="title font-bold text-center mb-6">
          Discover Open Mic Events!
        </h1>

        <p className="text-sm xs:text-sm text-center mt-4 mb-6">
          Know or host an amazing open mic event? Share it with the local
          community through MicFinder. Whether it&apos;s comedy, music, poetry,
          or any live performance, let&apos;s spread the word and fill the room!
        </p>

        <div className="text-center mb-8">
          <MemoizedEventForm />
        </div>

        <h2 className="text-md font-semibold text-center mt-4 sm:mt-2 mb-4 xs:mb-2">
          Ready to explore? Select your city and date to find local events!
        </h2>

        <p className="text-sm text-center mb-4 sm:mb-2 xs:mb-1">
          Scroll to see all upcoming events and discover your next stage.
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
                  {Object.keys(cityCoordinates)
                    .filter((city) =>
                      city.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .sort((a, b) => a.localeCompare(b))
                    .map((city) => (
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
                onFocus={openDatePicker} // Opens date picker on focus
                open={isDatePickerOpen} // Controls visibility of the date picker
                onClickOutside={() => setIsDatePickerOpen(false)} // Closes on outside click
                onSelect={() => setIsDatePickerOpen(false)} // Closes upon selection
                className="modern-input w-full cursor-pointer" // Adds padding for icon space
                aria-label="Select date" // Accessible label for screen readers
              />
              <CalendarIcon
                className="h-5 w-5 text-zinc-900 absolute top-1/2 right-3 transform -translate-y-3/4 cursor-pointer"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Event List */}
        <section className="card-style">
          <h2
            className="title-style text-center"
            style={{ borderBottom: "0.15rem solid #f97316" }}
          >
            Events List:
          </h2>
          {selectedCity === "" ? (
            <p>Please select a city to see today&#39;s events.</p>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="event-item mt-2">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="details-label">📅 Date: {event.date}</p>
                <p className="details-label">📍 Location: {event.location}</p>
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
              No events found for {selectedCity || "the selected city"} on{" "}
              {selectedDate.toLocaleDateString()}.
            </p>
          )}
        </section>

        {/* Map Component */}
        <section className="card-style1">
          <button
            onClick={toggleMapVisibility}
            className="mb-4 text-zinc-900 rounded-lg shadow-lg px-4 py-2 bg-zinc-200 transition"
          >
            {isMapVisible ? "Hide Map" : "Show Map"}
          </button>
          {isMapVisible && MemoizedGoogleMap}
        </section>

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

                    {uniqueCities
                      .filter((city) =>
                        city.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => a.localeCompare(b))
                      .map((city) => (
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
              ? "All Events"
              : `Events in ${filterCity}`}
          </h2>
          <List
            height={600}
            itemCount={
              eventsByCity.filter(
                (event) => event.location && typeof event.location === "string"
              ).length
            }
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
