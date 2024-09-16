"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ReactDatePicker from "react-datepicker";
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
import { getLatLng } from "../utils/geocode";
import Script from "next/script";

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
  const datePickerRef = useRef<ReactDatePicker>(null);
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

  const handleCitySelect = (city: string) => {
    const normalizedCity = normalizeCityName(city);
    setSelectedCity(normalizedCity);
    setFilterCity(normalizedCity);
    setSearchTerm(normalizedCity);
  };

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => !prev);
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
      setLoadedItems(loadedItems + 5);
    }
  };

  const normalizeCityName = useCallback((name: string) => {
    return name.trim();
  }, []);

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
    setIsSecondDropdownOpen(false); // Close the second dropdown after selection
  };

  // Filter events based on the selected city
  const eventsByCity = useMemo(() => {
    return filterCity === "All Cities"
      ? events
      : events.filter((event) => {
          const location = event.location;
          if (location && typeof location === "string") {
            const locationParts = location.split(",");
            return (
              locationParts.length > 1 &&
              normalizeCityName(locationParts[1].trim()) === filterCity
            );
          }
          return false;
        });
  }, [filterCity, events, normalizeCityName]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "userEvents"));
        const fetchedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          fetchedEvents.push(doc.data() as Event);
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

        citiesSnapshot.forEach((doc) => {
          const cityData = doc.data();
          const city = cityData.city; // "City State" format, no need to manipulate
          citiesData[city] = {
            lat: cityData.coordinates.lat,
            lng: cityData.coordinates.lng,
          };
        });

        setCityCoordinates(citiesData); // Store city data with "City State"
      } catch (error) {
        console.error("Error fetching city data:", error);
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

      // Check if the event occurs on the same day of the week
      if (eventDay !== selectedDay) {
        return false;
      }

      // Add any additional general recurring logic here if needed

      return true;
    },
    []
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Check if the event matches the selected city
      const isInSelectedCity =
        selectedCity === "" ||
        (event.location && event.location.includes(selectedCity));

      // Check if the event matches the selected date
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const normalizedSelectedDate = new Date(selectedDate);
      normalizedSelectedDate.setHours(0, 0, 0, 0);
      const isOnSelectedDate = event.isRecurring
        ? isRecurringEvent(event.date, selectedDate)
        : eventDate.toDateString() === normalizedSelectedDate.toDateString();

      // Check if the event matches the search term
      const matchesSearchTerm = searchTerm
        ? (event.name &&
            event.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.location &&
            event.location.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      return isInSelectedCity && isOnSelectedDate && matchesSearchTerm;
    });
  }, [events, selectedCity, selectedDate, isRecurringEvent, searchTerm]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleEventSave = useCallback(
    async (event: Event) => {
      if (!isUserSignedIn) {
        alert("Please sign in to save events to your profile.");
        return;
      }

      try {
        await saveEvent(event);
        alert("Event saved to your profile successfully!");
      } catch (error) {
        alert(
          "Oops! Something went wrong while saving the event. Please try again."
        );
      }
    },
    [saveEvent, isUserSignedIn]
  );

  const uniqueCities = useMemo(() => {
    const citySet = new Set<string>();
    events.forEach((event) => {
      if (event.location) {
        const parts = event.location.split(", ");
        if (parts.length > 1) {
          const normalizedCity = normalizeCityName(parts[1].trim());
          if (normalizedCity.toLowerCase().includes(searchTerm.toLowerCase())) {
            citySet.add(normalizedCity);
          }
        }
      }
    });
    return Array.from(citySet).sort((a, b) => a.localeCompare(b));
  }, [events, searchTerm, normalizeCityName]);

  type LocationResponse = {
    city?: string;
    state?: string;
  };

  const fetchCityFromCoordinates = useCallback(
    async (latitude: number, longitude: number): Promise<string | null> => {
      try {
        const response = (await getLatLng(
          undefined,
          latitude,
          longitude
        )) as LocationResponse;

        // Return formatted city and state if both are present
        return response.city && response.state
          ? `${response.city} ${response.state}`
          : null;
      } catch (error) {
        console.error("Error fetching city and state:", error);
        return null;
      }
    },
    []
  ); // Dependency array is empty because this function doesn’t depend on any external state
  // Define fetchUserLocation using useCallback to memoize it
  const fetchUserLocation = useCallback(async () => {
    // Ensure navigator.geolocation is supported before proceeding
    if (!navigator.geolocation) {
      alert("Geolocation is not supported. Please select a city manually.");
      return;
    }

    // Get the current position using geolocation
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const cityWithState = await fetchCityFromCoordinates(
          latitude,
          longitude
        );

        if (cityWithState) {
          setSelectedCity(cityWithState);
          setFilterCity(cityWithState);
        } else {
          console.error("City and state could not be determined.");
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert(
          "Unable to retrieve your location. Please select a city manually."
        );
      }
    );
  }, [fetchCityFromCoordinates]);

  // useEffect that handles URL query parameters and fetches geolocation if necessary
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get("searchTerm");
    const city = urlParams.get("city");

    // Check if there's a city provided in the URL, otherwise fetch the user's geolocation
    if (city) {
      setSelectedCity(city);
      setFilterCity(city);
    } else {
      fetchUserLocation(); // Fetch geolocation only if no city is provided in the URL
    }

    // Handle the search term if present in the URL
    if (queryTerm) {
      setSearchTerm(queryTerm);
    } else {
      setSearchTerm("");
    }
  }, [fetchUserLocation]);

  // Handler to change the date
  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  // Open the date picker programmatically
  const openDatePicker = () => {
    if (datePickerRef && datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  };

  const selectedCityCoordinates = useMemo(() => {
    return cityCoordinates[selectedCity] || cityCoordinates["Spokane WA"];
  }, [selectedCity, cityCoordinates]);

  // Update map location only when the selected city coordinates change
  useEffect(() => {
    if (selectedCityCoordinates) {
      setMapLocation(selectedCityCoordinates);
    }
  }, [selectedCityCoordinates]);

  const MemoizedGoogleMap = useMemo(() => {
    return mapLocation && isMapVisible ? (
      <GoogleMap lat={mapLocation.lat} lng={mapLocation.lng} events={events} />
    ) : null;
  }, [mapLocation, isMapVisible, events]);

  const MemoizedEventForm = React.memo(EventForm);

  const sortedEventsByCity = eventsByCity.sort(
    (a, b) =>
      new Date(b.googleTimestamp).getTime() -
      new Date(a.googleTimestamp).getTime()
  );

  const OpenMicBanner = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);

      return () => clearTimeout(timer);
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
          content="https://www.thehumorhub.com/images/og-image-micfinder.jpg"
        />
      </Head>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-L4N0VS2TW8"
      ></Script>
      <Header />
      <div className="screen-container">
        <OpenMicBanner />
        <h1 className="title text-4xl font-bold text-center mb-6">
          Discover Open Mic Events!
        </h1>
        <p className="text-lg md:text-xl text-center mt-4 mb-6">
          Know or host an amazing open mic event? Share it with the local
          community through MicFinder to attract a crowd. Whether it&apos;s
          comedy, music, poetry, or any live performance, let&apos;s spread the
          word and fill the room!
        </p>

        <div className="text-center mb-8">
          <MemoizedEventForm />
        </div>
        <h2 className="text-lg font-semibold text-center mt-4 mb-4">
          Ready to explore? Select your city and date to find local events!
        </h2>

        <p className="text-md text-center mb-4">
          Scroll to see all upcoming events and discover your next stage.
        </p>

        <div className="flex flex-col justify-center items-center mt-2">
          {/* Dropdown with search input */}
          <div className="relative w-full max-w-xs">
            {/* Button to open/close dropdown */}
            <div
              className="modern-input cursor-pointer bg-zinc-100 text-zinc-900"
              onClick={() => {
                setIsFirstDropdownOpen((prev) => !prev);
                setIsSecondDropdownOpen(false);
              }}
            >
              {selectedCity || "Select a City"}
            </div>

            {/* Dropdown menu */}
            {isFirstDropdownOpen && (
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
          <div className="relative mt-2">
            <ReactDatePicker
              ref={datePickerRef}
              id="datePicker"
              selected={selectedDate}
              onChange={handleDateChange}
              className="modern-input"
            />
            <CalendarIcon
              className="h-5 w-5 text-black absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer"
              onClick={openDatePicker}
            />
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
            className="mb-4 text-orange-500 rounded-lg shadow-lg px-4 py-2 bg-zinc-200 hover:bg-orange-500 hover:text-zinc-200 transition"
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
                  setIsSecondDropdownOpen((prev) => !prev);
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
