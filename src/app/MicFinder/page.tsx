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
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "San Diego": { lat: 32.7157, lng: -117.1611 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  Honolulu: { lat: 21.3069, lng: -157.8583 },
  Boise: { lat: 43.615, lng: -116.2023 },
  Albuquerque: { lat: 35.0844, lng: -106.6504 },
  "Coeur D'Alene": { lat: 47.6777, lng: -116.7805 },
  Milwaukee: { lat: 43.0389, lng: -87.9065 },
  Washington: { lat: 38.9072, lng: -77.0369 },
  billings: { lat: 45.7833, lng: -108.5007 },
  Bozeman: { lat: 45.6769, lng: -111.0429 },
  Nashville: { lat: 36.1627, lng: -86.7816 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Hayden: { lat: 47.766, lng: -116.7866 },
  Moscow: { lat: 46.7324, lng: -117.0002 },
  "Post Falls": { lat: 47.718, lng: -116.9516 },
  Sandpoint: { lat: 48.2766, lng: -116.5535 },
  Nampa: { lat: 43.5407, lng: -116.5635 },
  Pocatello: { lat: 42.8713, lng: -112.4455 },
  Anchorage: { lat: 61.2181, lng: -149.9003 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  "New York": { lat: 40.7128, lng: -74.006 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  Bronx: { lat: 40.8448, lng: -73.8648 },
  Queens: { lat: 40.7282, lng: -73.7949 },
  Portland: { lat: 45.5051, lng: -122.675 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  "Salt Lake City": { lat: 40.7608, lng: -111.891 },
  Cheney: { lat: 47.4894065, lng: -117.5800534 },
  "Medical Lake": { lat: 47.5686687, lng: -117.703776 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  "Spokane Valley": { lat: 47.6733, lng: -117.2394 },
  Spokane: { lat: 47.6588, lng: -117.426 },
  Phoenix: { lat: 33.4484, lng: -112.074 },
  Tacoma: { lat: 47.2529, lng: -122.4443 },
  Minneapolis: { lat: 44.9778, lng: -93.265 },
  Detroit: { lat: 42.3314, lng: -83.0458 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  "New Orleans": { lat: 29.9511, lng: -90.0715 },
  "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
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

  const normalizeCityName = (name: string) => {
    return name
      .replace(/(ID|CA|FL|HA|MA|NY|OR|TX|UT|WA|AZ|MN|MI|LA|NV|OK)/g, "")
      .trim();
  };

  // Then apply this in your handleCityFilterChange and anywhere else necessary:
  const handleCityFilterChange = useCallback(
    (city: string) => {
      const normalizedCity = normalizeCityName(city);
      setFilterCity(normalizedCity);
      setSelectedCity(normalizedCity);
    },
    [setFilterCity, setSelectedCity]
  );

  const uniqueCities = useMemo(() => {
    return Array.from(
      new Set(
        events
          .flatMap((event) => {
            if (event.location) {
              const locationParts = event.location.split(",");
              if (locationParts.length > 1) {
                return normalizeCityName(locationParts[1].trim());
              }
            }
            return [];
          })
          .filter((city) => city !== "")
      )
    );
  }, [events]);

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
        const querySnapshot = await getDocs(collection(db, "userEvents")); // Change "events" to "userEvents"
        const fetchedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          fetchedEvents.push(doc.data() as Event);
        });
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events: ", error);
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

      if (event.id === "10" || event.id === "14") {
        const thirdThursday = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        let thursdayCount = 0;
        while (thursdayCount < 3) {
          if (thirdThursday.getDay() === 4) {
            thursdayCount++;
            if (thursdayCount === 3) break;
          }
          thirdThursday.setDate(thirdThursday.getDate() + 1);
        }
        return selectedDate.getDate() === thirdThursday.getDate();
      }

      if (event.id === "1") {
        const weekOfMonth = Math.floor((selectedDate.getDate() - 1) / 7) + 1;
        return weekOfMonth === 2 || weekOfMonth === 4;
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
        ? event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        alert("You must be signed in to save events.");
        return;
      }

      try {
        await saveEvent(event);
        alert("Event saved to your profile!");
      } catch (error) {
        console.error("Error saving event:", error);
        alert("There was a problem saving the event.");
      }
    },
    [saveEvent, isUserSignedIn]
  );

  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const normalizedCity = normalizeCityName(event.target.value);
      setSelectedCity(normalizedCity);
      setFilterCity(normalizedCity); // Also update the filterCity
    },
    [setSelectedCity, setFilterCity, normalizeCityName]
  );

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
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <p className="font-bold">📅 Date: {event.date}</p>
        <p className="font-bold">📍 Location: {event.location}</p>
        <div className="details font-bold">
          <span className="details-label">ℹ️ Details:</span>
          <div dangerouslySetInnerHTML={{ __html: event.details }} />
        </div>
      </div>
    );
  };

  return (
    <>
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
          Ready to explore? Select your city and date below to discover events
          near you!
        </h2>
        <p className="text-md text-center mb-4">
          Or simply scroll down to see all upcoming events and find your next
          stage or audience.
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
                    /(ID|CA|FL|HA|MA|NY|OR|TX|UT|WA|AZ|MN|MI|LA|NV|OK)/g,
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
              <div key={event.id} className="event-item">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="details-label">📅 Date: {event.date}</p>
                <p className="details-label">📍 Location: {event.location}</p>
                <div className="details-label">
                  <span className="details-label">ℹ️ Details:</span>
                  <div dangerouslySetInnerHTML={{ __html: event.details }} />
                </div>
                <button
                  className="btn mt-1 px-1 py-1"
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
          <MemoizedGoogleMap
            lat={selectedCityCoordinates.lat}
            lng={selectedCityCoordinates.lng}
            events={filteredEvents}
          />
        </section>

        <section className="card-style">
          <div className="city-filter flex flex-wrap">
            <br />
            <br />
            <button
              onClick={() => handleCityFilterChange("All Cities")}
              className="city-button m-1 underline text-orange-400 font-bold text-lg hover:text-orange-300 flex-grow"
            >
              All Cities
            </button>
            {uniqueCities
              .sort((a, b) => a.localeCompare(b))
              .map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityFilterChange(city)}
                  className="city-button m-1 underline text-orange-500 hover:text-orange-400 flex-grow"
                >
                  {city}
                </button>
              ))}
          </div>
          <h2
            className="title-style text-center"
            style={{
              border: "0.15rem solid #f97316",
              margin: ".5rem",
            }}
          >
            {filterCity === "All Cities"
              ? "All Events"
              : `All Events in ${filterCity}`}
          </h2>
          <List
            height={500}
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
            itemSize={200}
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
