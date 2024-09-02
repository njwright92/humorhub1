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
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase.config";
import Header from "../components/header";
import Footer from "../components/footer";
import { onAuthStateChanged } from "firebase/auth";
import { FixedSizeList as List } from "react-window";
import Head from "next/head";

const GoogleMap = dynamic(() => import("../components/GoogleMap"), {
  loading: () => <p>Loading map...</p>,
  ssr: false,
});

const EventForm = dynamic(() => import("../components/EventForm"), {
  loading: () => <p>Loading form...</p>,
  ssr: false,
});

type Event = {
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

const CityCoordinates = {
  Albuquerque: { lat: 35.0844, lng: -106.6504 },
  Allentown: { lat: 40.6077573, lng: -75.4611807 },
  Akron: { lat: 41.076866, lng: -81.524132 },
  Anchorage: { lat: 61.2181, lng: -149.9003 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Bear: { lat: 39.6295, lng: -75.6581 },
  Beaverton: { lat: 45.4870617, lng: -122.8037102 },
  Billings: { lat: 45.7833, lng: -108.5007 },
  Boise: { lat: 43.615, lng: -116.2023 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Bozeman: { lat: 45.6769, lng: -111.0429 },
  Bronx: { lat: 40.8448, lng: -73.8648 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  Cheney: { lat: 47.4894065, lng: -117.5800534 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Canton: { lat: 40.8503587, lng: -81.4267892 },
  "Coeur D'Alene": { lat: 47.6777, lng: -116.7805 },
  Columbia: { lat: 39.1901561, lng: -76.8175023 },
  Columbus: { lat: 32.4609764, lng: -84.9877094 },
  "Daytona Beach": { lat: 29.2235327, lng: -81.0094693 },
  Decatur: { lat: 39.8406241, lng: -88.9756177 },
  Denver: { lat: 39.7392358, lng: -104.990251 },
  Detroit: { lat: 42.3314, lng: -83.0458 },
  "Elmwood Park": { lat: 40.9045405, lng: -74.1205676 },
  "Forest Park": { lat: 33.62601, lng: -84.4012734 },
  Glendale: { lat: 33.5387, lng: -112.186 },
  Hayden: { lat: 47.766, lng: -116.7866 },
  "Highland Park": { lat: 42.4035053, lng: -83.1125465 },
  Hollywood: { lat: 34.1543875, lng: -118.3711861 },
  Honolulu: { lat: 21.3069, lng: -157.8583 },
  Kenmore: { lat: 42.5835732, lng: -87.819903 },
  Kokomo: { lat: 40.4862354, lng: -86.1331129 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  Louisville: { lat: 38.234861, lng: -85.719492 },
  "Medical Lake": { lat: 47.5686687, lng: -117.703776 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  Milwaukee: { lat: 43.0389, lng: -87.9065 },
  Minneapolis: { lat: 44.9778, lng: -93.265 },
  Moscow: { lat: 46.7324, lng: -117.0002 },
  Murrieta: { lat: 33.5539143, lng: -117.2139232 },
  Nampa: { lat: 43.5407, lng: -116.5635 },
  Nashville: { lat: 36.1627, lng: -86.7816 },
  "New Bedford": { lat: 41.6350481, lng: -70.9286609 },
  "New Orleans": { lat: 29.9511, lng: -90.0715 },
  "New Windsor": { lat: 41.4867627, lng: -74.0957725 },
  "New York": { lat: 40.7128, lng: -74.006 },
  Niles: { lat: 41.2030337, lng: -80.7385968 },
  "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
  Phoenix: { lat: 33.4484, lng: -112.074 },
  Pocatello: { lat: 42.8713, lng: -112.4455 },
  Portland: { lat: 45.5051, lng: -122.675 },
  "Post Falls": { lat: 47.718, lng: -116.9516 },
  Pottstown: { lat: 40.2451663, lng: -75.6515229 },
  Queens: { lat: 40.7282, lng: -73.7949 },
  "Salt Lake City": { lat: 40.7608, lng: -111.891 },
  Salem: { lat: 44.9428975, lng: -123.0350963 },
  "San Diego": { lat: 32.7157, lng: -117.1611 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Sandpoint: { lat: 48.2766, lng: -116.5535 },
  Scottsdale: { lat: 33.4942, lng: -111.9261 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  "Sierra Vista": { lat: 31.553892, lng: -110.3075604 },
  Southfield: { lat: 42.5042688, lng: -83.3189533 },
  Spokane: { lat: 47.6588, lng: -117.426 },
  "Spokane Valley": { lat: 47.6733, lng: -117.2394 },
  "Spring City": { lat: 40.1804829, lng: -75.5506116 },
  Steelton: { lat: 40.2359312, lng: -76.8324723 },
  Tacoma: { lat: 47.2529, lng: -122.4443 },
  Vancouver: { lat: 45.6387281, lng: -122.6614861 },
  "Valley Stream": { lat: 40.6623762, lng: -73.7018421 },
  WashingtonDC: { lat: 38.9072, lng: -77.0369 },
  Westminster: { lat: 39.8934345, lng: -105.1591677 },
  "Fountain Hills": { lat: 33.6060096, lng: -111.7190258 },
  Livonia: { lat: 42.3683716, lng: -83.3619147 },
  Largo: { lat: 27.8790713, lng: -82.7902723 },
  "Pinetop-Lakeside": { lat: 34.1533762, lng: -109.9748472 },
  Tempe: { lat: 33.3629125, lng: -111.9302 },
  Mobile: { lat: 30.6920606, lng: -88.0432524 },
  Tampa: { lat: 27.9443731, lng: -82.3460527 },
  Williamsburg: { lat: 40.7081, lng: -73.9571 },
  Evanston: { lat: 42.0451, lng: -87.6877 },
  Auburn: { lat: 44.0979, lng: -70.2312 },
  Mesa: { lat: 33.4152, lng: -111.8315 },
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

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => !prev);
  };

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
    return name
      .replace(
        /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g,
        ""
      )
      .trim();
  }, []);

  const handleCityFilterChange = useCallback(
    (city: string) => {
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
    },
    [setFilterCity, setSelectedCity, normalizeCityName, setSearchTerm]
  );

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
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get("searchTerm");
    const city = urlParams.get("city");

    if (city) {
      setSelectedCity(city);
      setFilterCity(city);
    }

    if (queryTerm) {
      setSearchTerm(queryTerm);
    } else {
      setSearchTerm("");
    }
  }, []);

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
        console.error("Error fetching events: ", error);
        alert(
          "Oops! We couldn't load the events at the moment. Please try again later."
        );
      }
    };

    fetchEvents();
  }, []);

  const isRecurringEvent = useCallback(
    (eventDate: string, selectedDate: Date, event: Event): boolean => {
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

      if (eventDay !== selectedDay) {
        return false;
      }

      if (event.id === "814") {
        // Every third Wednesday of the month
        const firstDayOfMonth = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        let thirdWednesday =
          firstDayOfMonth.getDay() === 3
            ? 1 + 14
            : 15 - ((firstDayOfMonth.getDay() + 2) % 7);
        while (thirdWednesday <= 0) {
          thirdWednesday += 7;
        }
        return selectedDate.getDate() === thirdWednesday;
      }

      if (event.id === "815") {
        // 1st and 3rd Sunday of the month
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return (
          selectedDate.getDay() === 0 &&
          (weekOfMonth === 1 || weekOfMonth === 3)
        );
      }

      if (event.id === "816") {
        // Every last Tuesday of the month
        const lastDayOfMonth = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        );
        const lastTuesday =
          lastDayOfMonth.getDate() - ((lastDayOfMonth.getDay() + 6) % 7);
        return selectedDate.getDate() === lastTuesday;
      }

      if (event.id === "12") {
        const firstFriday = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        while (firstFriday.getDay() !== 5) {
          firstFriday.setDate(firstFriday.getDate() + 1);
        }
        const diffInDays = Math.ceil(
          (selectedDate.getTime() - firstFriday.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return diffInDays % 14 < 7;
      }

      if (event.id === "1") {
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return weekOfMonth === 2 || weekOfMonth === 4;
      }

      if (event.id === "819") {
        // 2nd and 4th Wednesday of the month
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return selectedDay === 3 && (weekOfMonth === 2 || weekOfMonth === 4);
      }
      if (event.id === "856") {
        // 2nd and 4th Friday of the month
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return selectedDay === 5 && (weekOfMonth === 2 || weekOfMonth === 4);
      }
      if (event.id === "888") {
        // 1st Monday of the month
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return selectedDay === 1 && weekOfMonth === 1;
      }
      if (event.id === "886") {
        // 1st and 3rd Monday of the month
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return selectedDay === 1 && (weekOfMonth === 1 || weekOfMonth === 3);
      }

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
        ? isRecurringEvent(event.date, selectedDate, event)
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
        console.error("Error saving event:", error);
        alert(
          "Oops! Something went wrong while saving the event. Please try again."
        );
      }
    },
    [saveEvent, isUserSignedIn]
  );

  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const normalizedCity = normalizeCityName(event.target.value);
      setSelectedCity(normalizedCity);
      setFilterCity(normalizedCity);
      setSearchTerm(normalizedCity);
    },
    [setSelectedCity, setFilterCity, normalizeCityName, setSearchTerm]
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

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const selectedCityCoordinates =
    (CityCoordinates as any)[selectedCity] || CityCoordinates["Spokane"];

  const openDatePicker = () => {
    if (datePickerRef && datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  };

  const MemoizedGoogleMap = React.memo(GoogleMap);
  const MemoizedEventForm = React.memo(EventForm);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const event = eventsByCity[index];

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
      </Head>
      <Header />
      <div className="screen-container">
        <h1 className="title text-4xl font-bold text-center mb-6">
          Discover Open Mic Events!
        </h1>
        <p className="text-lg md:text-xl text-center mt-4 mb-6">
          Hosting or know about an amazing open mic event? This is the perfect
          spot to share it with the local community and attract a crowd. Whether
          it&#39;s comedy, poetry, music, or any form of live performance,
          let&#39;s get the word out and fill the room!
        </p>
        <div className="text-center mb-8">
          <MemoizedEventForm />
        </div>
        <h2 className="text-lg font-semibold text-center mt-4 mb-4">
          Ready to explore? Select your city and date to find local events!
        </h2>

        <p className="text-md text-center mb-4">
          Scroll to see all upcoming events and discover your next stage or
          audience.
        </p>

        <div className="flex flex-col justify-center items-center mt-2">
          <select
            id="citySelect"
            name="selectedCity"
            value={selectedCity}
            onChange={handleCityChange}
            className="modern-input max-w-xs mx-auto"
          >
            <option value="">Select a City</option>
            {Object.keys(CityCoordinates).map((city) => (
              <option key={city} value={city}>
                {city
                  .replace(
                    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g,
                    ""
                  )
                  .trim()}
              </option>
            ))}
          </select>

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
            className="mb-4 text-orange-500 rounded-lg shadow-lg px-4 py-2 bg-zinc-200 hover:bg-orange-500 hover:text-zinc-200 active:bg-orange-500 active:text-zinc-200 transition"
          >
            {isMapVisible ? "Hide Map" : "Show Map"}
          </button>
          {isMapVisible && (
            <MemoizedGoogleMap
              lat={selectedCityCoordinates.lat}
              lng={selectedCityCoordinates.lng}
              events={filteredEvents}
            />
          )}
        </section>

        <section className="card-style">
          {/* Updated City Filter Section */}
          <div className="city-filter flex flex-wrap">
            <button
              onClick={() => handleCityFilterChange("All Cities")}
              className="city-button m-1 underline hover:no-underline flex-grow text-orange-700 text-lg"
            >
              All Cities
            </button>
            {uniqueCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCityFilterChange(city)}
                className="city-button m-1 underline hover:no-underline text-orange-500 text-md flex-grow"
              >
                {city}
              </button>
            ))}
          </div>
          <h2 className="title-style text-center">
            {filterCity === "All Cities"
              ? "All Events"
              : `Events in ${filterCity}`}
          </h2>
          <List
            height={600}
            itemCount={
              eventsByCity
                .filter(
                  (event) =>
                    event.location && typeof event.location === "string"
                )
                .sort((a, b) => {
                  const cityA = a.location.split(", ")[1]?.trim();
                  const cityB = b.location.split(", ")[1]?.trim();
                  return cityA.localeCompare(cityB);
                }).length
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
