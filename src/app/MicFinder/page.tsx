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

const cityCoordinates: CityCoordinates = {
  "Los Angeles CA": { lat: 34.0522, lng: -118.2437 },
  "San Diego CA": { lat: 32.7157, lng: -117.1611 },
  "San Francisco CA": { lat: 37.7749, lng: -122.4194 },
  "Miami FL": { lat: 25.7617, lng: -80.1918 },
  "Maui HA": { lat: 20.7984, lng: -156.3319 },
  "Boise ID": { lat: 43.615, lng: -116.2023 },
  "Coeur D'Alene ID": { lat: 47.6777, lng: -116.7805 },
  "Hayden ID": { lat: 47.766, lng: -116.7866 },
  "Moscow ID": { lat: 46.7324, lng: -117.0002 },
  "Post Falls ID": { lat: 47.718, lng: -116.9516 },
  "Sandpoint ID": { lat: 48.2766, lng: -116.5535 },
  "Boston MA": { lat: 42.3601, lng: -71.0589 },
  "New York City NY": { lat: 40.7128, lng: -74.006 },
  "Portland OR": { lat: 45.5051, lng: -122.675 },
  "Austin TX": { lat: 30.2672, lng: -97.7431 },
  "Salt Lake City UT": { lat: 40.7608, lng: -111.891 },
  "Cheney WA": { lat: 47.4894065, lng: -117.5800534 },
  "Medical Lake WA": { lat: 47.5686687, lng: -117.703776 },
  "Seattle WA": { lat: 47.6062, lng: -122.3321 },
  "Spokane Valley WA": { lat: 47.6733, lng: -117.2394 },
  "Spokane WA": { lat: 47.6588, lng: -117.426 },
};

const mockEvents: Event[] = [
  {
    id: "1",
    isRecurring: true,
    name: "Open Mic",
    location:
      "The Goody Bar and Grill 8712 E SPRAGUE AVE #1000, Spokane Valley WA",
    date: "Monday",
    lat: 47.656721,
    lng: -117.2902616,
    details: `
      Every other monday. Hosted by Anthony Singleton, welcoming all talents including musicians, comedians, spoken word, and improv. Contact: 509-557-3999 or visit <a href="https://www.lyyv.tv" target="_blank" style="text-decoration: underline; color: blue;">lyyv.tv</a> for more info. 
      <a href="https://www.google.com/maps/place/The+Goody+Bar+And+Grill/@47.6567246,-117.2902616,17z/data=!3m1!4b1!4m6!3m5!1s0x549e21c949eed8cb:0xbd4d1292f17e8c43!8m2!3d47.656721!4d-117.2876867!16s%2Fg%2F1trrcxqj?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
  {
    id: "2",
    isRecurring: true,
    name: "New Talent Tuesday!",
    location: "Spokane Comedy Club, Spokane WA",
    date: "Tuesday",
    lat: 47.65703,
    lng: -117.4352294,
    details: `
      Every Tuesday, Featuring: Amateur and Professional comedians trying out new material. Free admission. Shows starting at 9:30pm or later are 21+, earlier shows are 18+ with valid ID. 
      Visit <a href="https://www.spokanecomedyclub.com/" target="_blank" style="text-decoration: underline; color: blue;">Spokane Comedy Club</a> for more info. 
      <a href="https://www.google.com/maps/place/Spokane+Comedy+Club/@47.657017,-117.4193719,17z/data=!3m1!4b1!4m6!3m5!1s0x549e1861e8e0198d:0xba09c4ee88e9b25e!8m2!3d47.657017!4d-117.416797!16s%2Fg%2F11cm6j1zpw?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
  {
    id: "3",
    isRecurring: true,
    name: "T'S ON A TUESDAY",
    location: "T's Lounge, Spokane WA",
    date: "Tuesday",
    lat: 47.6636398,
    lng: -117.4294504,
    details: `
    Signup in person at 7:45pm. starts at 8pm usually 9ish on New Talent Nights. What's a comedy scene without a dive bar mic? T's On A Tuesday has been going strong for years and is the perfect place to test out your newest material. There is usually a large caravan of comics who come to T's after New Talent is done, and offers the type of stage where you can really let your hair down. Anything can (and likely will) happen at this mic, and it's never not a good time, but only if you enjoy telling jokes. <a href="https://tsspokane.com/>tsspokane.com</a> 
    <a href="https://www.google.com/maps/place/T's+Lounge/@47.6636398,-117.4294504,17z/data=!3m1!4b1!4m6!3m5!1s0x549e185ed5817429:0x475d58f4a48ae52b!8m2!3d47.6636398!4d-117.4268755!16s%2Fg%2F11c5ss4c1c?entry=ttu" ttarget="_blank" style="text-decoration: underline; color: green;">
      View on Google Maps
    </a>
  `,
  },
  {
    id: "4",
    isRecurring: true,
    name: "QUEER COMEDY NIGHT",
    location: "nYne Bar & Bistro, Spokane WA",
    date: "Tuesday",
    lat: 47.6573563,
    lng: -117.4147831,
    details: `
    Signup in person at 7:30pm. starts at 8pm. nYne is one of our local gay bars, so any and all comics who identify as LGBTQIA+ are strongly encouraged to go. This open mic is one of 3 that are on Tuesday nights, so if you're looking to string performances together, don't miss it! Queer allies are also welcome! <a href="https://www.nynebar.com/>nynebar.com</a>
    <a href="https://www.google.com/maps/place/nYne+Bar+%26+Bistro/@47.6573563,-119.1693299,8z/data=!4m10!1m2!2m1!1sn9ne+bistro!3m6!1s0x549e188a0e23298d:0xe96a55dc6ee16314!8m2!3d47.6573563!4d-117.4147831!15sCgtuOW5lIGJpc3Ryb1oNIgtuOW5lIGJpc3Ryb5IBDmdheV9uaWdodF9jbHVimgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVU56Y1hOdU0zRlJSUkFC4AEA!16s%2Fg%2F1vzv3cvm?entry=ttu" ttarget="_blank" style="text-decoration: underline; color: green;">
      View on Google Maps
    </a>
  `,
  },
  {
    id: "5",
    isRecurring: true,
    name: "Open Mic Night!",
    location: "Spokane Comedy Club, Spokane WA",
    date: "Wednesday",
    lat: 47.65703,
    lng: -117.4352294,
    details: `
      Every Wednesday, A night with professional and first-time comedians. Free admission. Happy hour all night. 
      Sign-up for comedians available at <a href="https://www.barkentertainment.com/open-mic" target="_blank" style="text-decoration: underline; color: blue;">openmicer.com</a>. 
      <a href="https://www.google.com/maps/place/Spokane+Comedy+Club/@47.657017,-117.4193719,17z/data=!3m1!4b1!4m6!3m5!1s0x549e1861e8e0198d:0xba09c4ee88e9b25e!8m2!3d47.657017!4d-117.416797!16s%2Fg%2F11cm6j1zpw?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
  {
    id: "6",
    isRecurring: true,
    name: "Open Mic Night..",
    location: "Tervan Tavern 411 Cedar St, Sandpoint ID",
    date: "Wednesday",
    lat: 48.2759385,
    lng: -116.6349728,
    details: `
      Open Mic Night. Bring your talent in front of a live audience with a chill vibe. Be it song, instrument, comedy, improv, or magic, come show it off. Hosted by the Tervan Tavern, 411 Cedar St. starting at 6:00(ish) p.m. on Wednesdays.
      Visit <a href="https://tervantavern.com/" target="_blank" style="text-decoration: underline; color: blue;">Tervan Tavern</a> for more info.
      <a href="https://www.google.com/maps/dir//411+Cedar+St,+Sandpoint,+ID+83864/@48.2759385,-116.6349728,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x5363d6c8c06638a5:0x9a6ea93138ab0076!2m2!1d-116.5525742!2d48.2759868?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
  {
    id: "7",
    isRecurring: true,
    name: "Open Mic Stand Up Comedy!",
    location: "The Draft Zone, Post Falls ID",
    date: "Thursday",
    lat: 47.7057509,
    lng: -117.0270137,
    details: `
      Weekly open mic stand-up comedy event. Every Thursday through 1/24. Free admission. 
      Visit <a href="https://draftzonepf.com" target="_blank" style="text-decoration: underline; color: blue;">Draft Zone </a> for more info. <a href="https://www.google.com/maps/place/The+Draft+Zone/@47.7057509,-117.0270137,15z/data=!3m1!4b1!4m6!3m5!1s0x5361ddbc4da8868b:0xc1f752f8c519f0f4!8m2!3d47.7057379!4d-117.0085598!16s%2Fg%2F11gy3bsw8c?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
  {
    id: "8",
    isRecurring: true,
    name: "Quincy Belt Tournament of Champions!",
    location: "The Draft Zone, Post Falls ID",
    date: "Thursday",
    lat: 47.7057509,
    lng: -117.0270137,
    details: `Post Falls, ID. Entry: Online/In Person. Free entry, no content restrictions. 
    Qualify by winning the "Quincy Belt" at the open mic (Thursdays) or via video submission by 12/14. 
    Semifinals: 2/3/24, 3/2/24, 4/6/24, 5/4/24. Finals: 6/1/24. Prizes: 1st - $1000, 2nd - $500, 3rd/4th - $250 each. 
    Email: jaybergcomedy@gmail.com for details and entries. visit <a href="https://draftzonepf.com" target="_blank" style="text-decoration: underline; color: blue;">Draft Zone </a> for more info. <a href="https://www.google.com/maps/place/The+Draft+Zone/@47.7057509,-117.0270137,15z/data=!3m1!4b1!4m6!3m5!1s0x5361ddbc4da8868b:0xc1f752f8c519f0f4!8m2!3d47.7057379!4d-117.0085598!16s%2Fg%2F11gy3bsw8c?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.`,
  },
  {
    id: "9",
    isRecurring: true,
    name: "LITTLE NEVADA COMEDY OPEN MIC",
    location: "Little Nevada Restaurant and Lounge, Spokane WA",
    date: "Thursday",
    lat: 47.7015451,
    lng: -117.3999719,
    details: `
    Signup in person at 6:00pm starts 6:30pm-ishThe Little Nevada Comedy Open Mic is Spokane's newest open mic! Located in the northern-ish part of Spokane, this spot (and every other one, for that matter) is only as good as you make it, so get to writing! <a href="https://www.facebook.com/thelittlenevada/about"> little nevada Facebook</a>
    <a href="https://www.google.com/maps/place/The+Little+Nevada+Restaurant+%26+Lounge/@47.7015451,-117.3999719,17z/data=!3m1!4b1!4m6!3m5!1s0x549e19133302e643:0x1f7e41b2e502ce4!8m2!3d47.7015452!4d-117.3953585!16s%2Fg%2F11h5rcfc77?entry=ttu" ttarget="_blank" style="text-decoration: underline; color: green;">
      View on Google Maps
    </a>
  `,
  },
  {
    id: "10",
    isRecurring: true,
    name: "3RD THURSDAY COMEDY OPEN MIC",
    location: "Fox Hole Bar and Grill, Medical Lake WA",
    date: "Thursday",
    lat: 47.5725708,
    lng: -117.6844563,
    details: `
    Signup in person or DM starts at 7:00pm sharpHappens on the 3RD THURSDAY OF THE MONTH. It is an open mic with a 20-min feature act at the end. Comics get the light when they have 1 min remaining. If you're looking to perform at the Fox Hole and DZ, let Chris know so he can put you towards the front of the lineup. Every comic that performs gets an even cut of tips @ the end of the show, so it pays (at least a little bit) to be (at least a little bit) funny. <a href="https://www.facebook.com/thefoxholemedicallake/"> foxholemedicallake Facebook</a> 
    <a href="https://www.google.com/maps/place/The+Foxhole+Bar+and+Grill/@47.5725708,-117.6844563,17z/data=!3m1!4b1!4m6!3m5!1s0x549e6b079450a8a7:0x706aa4e325b9b6cd!8m2!3d47.5725708!4d-117.6818814!16s%2Fg%2F11syxzl8hk?entry=ttu" ttarget="_blank" style="text-decoration: underline; color: green;">
      View on Google Maps
    </a>
  `,
  },
  {
    id: "11",
    isRecurring: true,
    name: "Open Mic Night at The Grain Shed",
    location: "The Grain Shed Taproom, Spokane WA",
    date: "Friday",
    lat: 47.6561077,
    lng: -117.4348802,
    details: `
    Hosted by Anthony Singleton. Open Mic Night for music and comedy. 
    Every Friday from 5:30 PM to 8:30ish PM. All ages welcome. Clean mic. Free admission. 
    <a href="https://www.google.com/maps/place/The+Grain+Shed+Taproom/@47.6561077,-117.4348802,17z/data=!3m2!4b1!5s0x549e18680a2601e7:0x1a13f3af47308d34!4m6!3m5!1s0x549e194b26b6f1a1:0x6df1cdc8cd28c935!8m2!3d47.6561041!4d-117.4323053!16s%2Fg%2F11thk6c6yx?entry=ttu" ttarget="_blank" style="text-decoration: underline; color: green;">
      View on Google Maps
    </a>
  `,
  },
  {
    id: "12",
    isRecurring: true,
    name: "FRIDAY FUNNIES",
    location: "The Garland Drinkery, Spokane WA",
    date: "Friday",
    lat: 47.693665,
    lng: -117.4268169,
    details: `
    The Garland Drinkery is one of the newer mics in the area, and offers a fun space to perform in Spokane's Historic Garland District. Snag some grub at the Milk Bottle before your set and get those laughs on! This mic happens EVERY OTHER FRIDAY. Be sure to check our calendar so you know which Fridays those are! <a href="https://www.facebook.com/drinkerynation/"> drinkerynation Facebook</a> 
    <a href="https://www.google.com/maps/place/Garland+Drinkery/@47.693665,-117.4268169,17z/data=!3m1!4b1!4m6!3m5!1s0x549e191702e19759:0xb7c159246af19ef8!8m2!3d47.693665!4d-117.424242!16s%2Fg%2F1tdwptks?entry=ttu" ttarget="_blank" style="text-decoration: underline; color: green;">
      View on Google Maps
    </a>
  `,
  },
  {
    id: "13",
    isRecurring: true,
    name: "Stand Up Comedy Open Mic",
    location: "Spikes on 718 E Francis, Spokane WA",
    date: "Saturday",
    lat: 47.7147076,
    lng: -117.4008385,
    details: `
      Hosted by Anthony Singleton. Every Saturday at 7:00 PM. For more information follow @AnthonySingleton on social media. 
      <a href="https://www.google.com/maps/place/Spike's+Spokane/@47.7147076,-117.4008385,17z/data=!3m1!4b1!4m6!3m5!1s0x549e1eb3e673dd89:0xb506914f6e09b6e2!8m2!3d47.714704!4d-117.3982636!16s%2Fg%2F11_fkyq8p?entry=ttu" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
  {
    id: "14",
    isRecurring: true,
    name: "Open Mic Night at Emerge",
    location: "Emerge downtown, Coeur D'Alene ID",
    date: "Thursday",
    lat: 47.6742323,
    lng: -116.7842855,
    details: `
      Every third Thursday of the month - Singers, Songwriters, Poets, Spoken Word & Monologues welcome. All ages welcome.\n\nWe just ask that you be respectful of others in the space and are ready to experience a wide variety of performances. You may be introduced to a new form of expression you never even knew you would like!\n\nOpen Mic is sponsored by Emerge CDA and North Idaho Pride Alliance.\n\nFREE. RSVP is recommended, but not required. <a href="https://emergecda.com/" target="_blank" style="text-decoration: underline; color: blue;">Visit website</a>. <a href="https://www.google.com/maps/place/Emerge/@47.6742323,-116.7842855,15z/data=!4m2!3m1!1s0x0:0xfe97b08bde5da689?sa=X&ved=2ahUKEwjRtISQ86ODAxV0MjQIHcuOBYoQ_BJ6BAgQEAA" target="_blank" style="text-decoration: underline; color: green;">View on Google Maps</a>.
    `,
  },
];

const EventsPage = () => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const datePickerRef = useRef<any>(null);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const { saveEvent } = useContext(EventContext);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("All Cities");

  const uniqueCities = useMemo(() => {
    return Array.from(
      new Set(
        allEvents
          .map((event) => {
            const locationParts = event.location.split(",");
            if (locationParts.length > 1) {
              return locationParts[1].trim();
            }
            return ""; // Return an empty string if there's no second part
          })
          .filter((city) => city !== "")
      )
    );
  }, [allEvents]);

  const handleCityFilterChange = useCallback(
    (city: string) => {
      setFilterCity(city);
    },
    [setFilterCity]
  ); // If setFilterCity doesn't change, you can omit it from the dependencies array

  // Filter events based on the selected city
  const eventsByCity = useMemo(() => {
    return filterCity === "All Cities"
      ? allEvents
      : allEvents.filter((event) => {
          const locationParts = event.location.split(",");
          return (
            locationParts.length > 1 && locationParts[1].trim() === filterCity
          );
        });
  }, [filterCity, allEvents]);

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

  const fetchEvents = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const fetchedEvents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      location: doc.data().location,
      name: doc.data().name,
      date: doc.data().date.toDate().toLocaleDateString(),
      details: doc.data().details,
      lat: doc.data().lat,
      lng: doc.data().lng,
      isRecurring: doc.data().isRecurring,
    }));

    setAllEvents([...mockEvents, ...fetchedEvents]);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
        selectedCity === "" || event.location.includes(selectedCity);

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
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return isInSelectedCity && isOnSelectedDate && matchesSearchTerm;
    });
  }, [events, selectedCity, selectedDate, isRecurringEvent, searchTerm]);

  const handleEventSave = useCallback(
    (event: Event) => {
      if (!isUserSignedIn) {
        alert("You must be signed in to save events.");
        return;
      }

      saveEvent(event)
        .then(() => {
          alert("Event saved to your profile!");
        })
        .catch((error) => {
          console.error("Error saving event:", error);
          alert("There was a problem saving the event.");
        });
    },
    [saveEvent, isUserSignedIn]
  );
  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCity(event.target.value);
    },
    []
  );

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const selectedCityCoordinates =
    cityCoordinates[selectedCity] || cityCoordinates["Spokane WA"];

  const openDatePicker = () => {
    if (datePickerRef && datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  };

  const MemoizedGoogleMap = React.memo(GoogleMap);
  const MemoizedEventForm = React.memo(EventForm);

  return (
    <div className="screen-container">
      <Header />
      <h1 className="title">Open Mic Events!</h1>
      <p className="text-lg md:text-xl text-center mt-4 mb-2 text-beige">
        Got an amazing event coming up? Share it here and get the word out to
        the local community!
      </p>
      <div className="text-center mb-2">
        <MemoizedEventForm />
      </div>
      <h6 className="text-center mt-4">
        Select your city and date to view events!
        <br />
        Or scroll down to see all events!
      </h6>
      <div className="flex flex-col justify-center items-center mt-2">
        <select
          id="citySelect"
          name="selectedCity"
          value={selectedCity}
          onChange={handleCityChange}
          className="modern-input max-w-xs mx-auto"
        >
          <option value="">Select a City</option>
          <option value="Los Angeles CA">Los Angeles, CA</option>
          <option value="San Diego CA">San Diego, CA</option>
          <option value="San Francisco CA">San Francisco, CA</option>
          <option value="Miami FL">Miami, FL</option>
          <option value="Maui HA">Maui, HA</option>
          <option value="Boise ID">Boise, ID</option>
          <option value="Coeur D&#39;Alene ID">Coeur D&#39;Alene, ID</option>
          <option value="Hayden ID">Hayden, ID</option>
          <option value="Moscow ID">Moscow, ID</option>
          <option value="Post Falls ID">Post Falls, ID</option>
          <option value="Sandpoint ID">Sandpoint, ID</option>
          <option value="Boston MA">Boston, MA</option>
          <option value="New York City NY">New York City, NY</option>
          <option value="Portland OR">Portland, OR</option>
          <option value="Austin TX">Austin, TX</option>
          <option value="Salt Lake City UT">Salt Lake City, UT</option>
          <option value="Cheney WA">Cheney, WA</option>
          <option value="Medical Lake WA">Medical Lake, WA</option>
          <option value="Seattle WA">Seattle, WA</option>
          <option value="Spokane Valley WA">Spokane Valley, WA</option>
          <option value="Spokane WA">Spokane, WA</option>
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
      <div className="card-style">
        <h2
          className="title-style text-center"
          style={{ borderBottom: "0.15rem solid #005eff" }}
        >
          Events List:
        </h2>
        {selectedCity === "" ? (
          <p>Please select a city to see today&#39;s events.</p>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="event-item">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="font-bold">📅 Date: {event.date}</p>
              <p className="font-bold">📍 Location: {event.location}</p>
              <div className="details font-bold">
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
      </div>

      {/* Map Component */}
      <div className="card-style">
        <MemoizedGoogleMap
          lat={selectedCityCoordinates.lat}
          lng={selectedCityCoordinates.lng}
          events={filteredEvents}
        />
      </div>

      <div className="card-style">
        <div className="city-filter flex flex-wrap">
          <br />
          <br />
          <button
            onClick={() => handleCityFilterChange("All Cities")}
            className="city-button m-1 underline text-red-700 font-bold text-lg hover:text-red-500 flex-grow"
          >
            All Cities
          </button>
          {uniqueCities.map((city) => (
            <button
              key={city}
              onClick={() => handleCityFilterChange(city)}
              className="city-button m-1 underline text-red-800 hover:text-red-500 flex-grow"
            >
              {city}
            </button>
          ))}
        </div>
        <h2
          className="title-style text-center"
          style={{ borderBottom: "0.15rem solid #005eff" }}
        >
          {filterCity === "All Cities"
            ? "All Events"
            : `All Events in ${filterCity}`}
        </h2>
        {eventsByCity.map((event) => (
          <div key={event.id} className="event-item">
            <h3 className="text-lg font-semibold">{event.name}</h3>
            <p className="font-bold">📅 Date: {event.date}</p>
            <p className="font-bold">📍 Location: {event.location}</p>
            <div className="details font-bold">
              <span className="details-label">ℹ️ Details:</span>
              <div dangerouslySetInnerHTML={{ __html: event.details }} />
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default EventsPage;
