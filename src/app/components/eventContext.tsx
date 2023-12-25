"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase.config";

export type Event = {
  id: string;
  name: string;
  location: string;
  date: string;
  lat: number;
  lng: number;
  details: string;
  isRecurring: boolean;
};

interface EventContextType {
  savedEvents: Event[];
  saveEvent: (event: Event) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const defaultContextValue: EventContextType = {
  savedEvents: [],
  saveEvent: () => Promise.resolve(),
  deleteEvent: () => Promise.resolve(),
};

const EventContext = createContext<EventContextType>(defaultContextValue);

type EventProviderProps = {
  children: ReactNode;
};

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);

  const saveEventToFirestore = async (event: Event) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const eventAlreadySaved = savedEvents.some((e) => e.id === event.id);

    if (!eventAlreadySaved) {
      const userEventsRef = doc(db, "userEvents", user.uid);
      const newEvents = [...savedEvents, event];
      await setDoc(userEventsRef, { events: newEvents }, { merge: true });
      setSavedEvents(newEvents);
    }
  };

  const deleteEventFromFirestore = async (eventId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const updatedEvents = savedEvents.filter((event) => event.id !== eventId);
      const userEventsRef = doc(db, "userEvents", user.uid);
      await setDoc(userEventsRef, { events: updatedEvents }, { merge: true });
      setSavedEvents(updatedEvents);
      alert("Event deleted successfully.");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event.");
    }
  };

  const fetchEventsFromFirestore = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userEventsRef = doc(db, "userEvents", user.uid);
    const docSnap = await getDoc(userEventsRef);
    if (docSnap.exists()) {
      setSavedEvents(docSnap.data().events);
    }
  };

  useEffect(() => {
    fetchEventsFromFirestore();
  }, []);

  const saveEvent = async (event: Event) => {
    const eventAlreadySaved = savedEvents.some((e) => e.id === event.id);

    if (eventAlreadySaved) {
      alert("This event is already saved.");
      return;
    }

    try {
      await saveEventToFirestore(event);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  return (
    <EventContext.Provider
      value={{ savedEvents, saveEvent, deleteEvent: deleteEventFromFirestore }}
    >
      {children}
    </EventContext.Provider>
  );
};
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};

export { EventContext };
