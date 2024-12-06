// "use client";

// import React, {
//   createContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useContext,
//   useMemo,
// } from "react";
// import { getAuth } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";
// import { db } from "../../../firebase.config";

// export type Event = {
//   id: string;
//   name: string;
//   location: string;
//   date: string;
//   lat: number;
//   lng: number;
//   details: string;
//   isRecurring: boolean;
// };

// interface EventContextType {
//   savedEvents: Event[];
//   saveEvent: (event: Event) => Promise<void>;
//   deleteEvent: (eventId: string) => Promise<void>;
// }

// const defaultContextValue: EventContextType = {
//   savedEvents: [],
//   saveEvent: () => Promise.resolve(),
//   deleteEvent: () => Promise.resolve(),
// };

// const EventContext = createContext<EventContextType>(defaultContextValue);

// type EventProviderProps = {
//   children: ReactNode;
// };

// export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
//   const [savedEvents, setSavedEvents] = useState<Event[]>([]);

//   const saveEventToFirestore = async (event: Event) => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;

//     const userEventsRef = doc(db, "userEvents", user.uid);
//     const updatedEvents = [...savedEvents, event];

//     await setDoc(userEventsRef, { events: updatedEvents }, { merge: true });
//     setSavedEvents(updatedEvents); // Update the state after saving to Firestore
//   };

//   const deleteEventFromFirestore = async (eventId: string) => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;
//     try {
//       const updatedEvents = savedEvents.filter((event) => event.id !== eventId);
//       const userEventsRef = doc(db, "userEvents", user.uid);
//       await setDoc(userEventsRef, { events: updatedEvents }, { merge: true });
//       setSavedEvents(updatedEvents);
//       alert("The event has been successfully removed from your saved list.");
//     } catch (error) {
//       alert(
//         "Oops! Something went wrong while trying to remove the event. Please try again later.",
//       );
//     }
//   };

//   const fetchEventsFromFirestore = async () => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;

//     const userEventsRef = doc(db, "userEvents", user.uid);
//     const docSnap = await getDoc(userEventsRef);
//     if (docSnap.exists()) {
//       setSavedEvents(docSnap.data().events);
//     }
//   };

//   useEffect(() => {
//     fetchEventsFromFirestore();
//   }, []);

//   const saveEvent = async (event: Event) => {
//     const eventAlreadySaved = savedEvents.some((e) => e.id === event.id);

//     if (eventAlreadySaved) {
//       alert("This event is already saved.");
//       return;
//     }

//     try {
//       await saveEventToFirestore(event);
//     } catch (error) {
//       alert(
//         "Oops! Something went wrong while saving the event. Please try again.",
//       );
//     }
//   };

//   const savedEventsMemo = useMemo(() => savedEvents, [savedEvents]);

//   return (
//     <EventContext.Provider
//       value={{
//         savedEvents: savedEventsMemo,
//         saveEvent,
//         deleteEvent: deleteEventFromFirestore,
//       }}
//     >
//       {children}
//     </EventContext.Provider>
//   );
// };

// export const useEvents = () => {
//   const context = useContext(EventContext);
//   if (!context) {
//     throw new Error(
//       "Oops! It looks like you are trying to access events outside of their provider. Please make sure your component is wrapped in an EventProvider.",
//     );
//   }
//   return context;
// };

// export { EventContext };
