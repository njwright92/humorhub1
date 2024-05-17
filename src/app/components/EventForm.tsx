"use client";

import { useState, useCallback, useMemo, ChangeEvent, FormEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import Modal from "./modal";
import { getLatLng } from "../utils/geocode";
interface EventData {
  name: string;
  location: string;
  date: Date | null;
  details: string;
  isRecurring: boolean;
  lat?: number;
  lng?: number;
}

const submitEvent = async (eventData: EventData) => {
  try {
    await addDoc(collection(db, "userEvents"), eventData);
  } catch (error) {
    console.error("Error adding event: ", error);
  }
};

const EventForm: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [event, setEvent] = useState<EventData>({
    name: "",
    location: "",
    date: null,
    details: "",
    isRecurring: false,
  });

  const [formErrors, setFormErrors] = useState<string>("");

  const memoizedEvent = useMemo(() => event, [event]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (
        !memoizedEvent.name ||
        !memoizedEvent.location ||
        !memoizedEvent.date ||
        !memoizedEvent.details
      ) {
        setFormErrors("Please fill in all required fields.");
        return;
      }
      const isError = (error: unknown): error is Error => {
        return (error as Error).message !== undefined;
      };

      setFormErrors("");
      try {
        // Convert the address to lat/lng
        const { lat, lng } = await getLatLng(memoizedEvent.location);

        // Prepare the event data with lat/lng
        const eventData: EventData = {
          ...memoizedEvent,
          lat,
          lng,
        };

        await submitEvent(eventData);
        setShowModal(false);
        alert(
          "Event has been added successfully! Check the events page to view! Email me with any issues."
        );
      } catch (error) {
        if (
          isError(error) &&
          error.message.includes("Failed to get latitude and longitude")
        ) {
          setFormErrors(
            "Could not find the location. Please enter a full and correct address, including the city and state."
          );
        } else {
          setFormErrors(
            "An unexpected error occurred. Please try again later."
          );
        }
      }
    },
    [memoizedEvent]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    },
    []
  );

  return (
    <>
      <button className="btn underline" onClick={() => setShowModal(true)}>
        Add Event
      </button>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <form
          onSubmit={handleSubmit}
          className="form-container mx-auto overflow-auto max-h-screen z-50"
        >
          {formErrors && <p className="text-red-500">{formErrors}</p>}
          <h1 className="text-2xl font-bold text-center text-black mt-4 ">
            Add Event Form
          </h1>
          <p className="text-red-500 text-center mb-1">
            Please fill in all fields correctly. Then submit, and your event
            will be added!
          </p>
          <label htmlFor="eventName" className="text-zinc-900">
            Event Name:
          </label>
          <input
            type="text"
            id="eventName"
            name="name"
            value={event.name}
            onChange={handleChange}
            className="text-zinc-900 shadow-xl rounded-lg p-2"
            required
            autoComplete="off"
          />

          <label htmlFor="location" className="text-zinc-900">
            Location must include full address:
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={event.location}
            onChange={handleChange}
            className="text-zinc-900 shadow-xl rounded-lg p-2"
            required
          />

          <label htmlFor="details" className="text-zinc-900">
            Details:
          </label>
          <textarea
            id="details"
            name="details"
            value={event.details}
            onChange={handleChange}
            className="text-zinc-900 shadow-xl rounded-lg p-2"
            required
            autoComplete="off"
          />

          <h6 className="text-zinc-900">Is it a recurring event?:</h6>
          <p className="text-red-500">
            If yes specify day of the week in details.
          </p>
          <div className="flex flex-row">
            <div className="flex flex-col items-center mr-4">
              <label htmlFor="isRecurringYes" className="text-zinc-900">
                Yes
              </label>
              <input
                type="checkbox"
                id="isRecurringYes"
                name="isRecurring"
                checked={event.isRecurring === true}
                onChange={() => setEvent({ ...event, isRecurring: true })}
                className="text-zinc-900 shadow-xl rounded-lg p-2"
              />
            </div>

            <div className="flex flex-col items-center">
              <label htmlFor="isRecurringNo" className="text-zinc-900">
                No
              </label>
              <input
                type="checkbox"
                id="isRecurringNo"
                name="isRecurring"
                checked={event.isRecurring === false}
                onChange={() => setEvent({ ...event, isRecurring: false })}
                className="text-zinc-900 shadow-xl rounded-lg p-2"
              />
            </div>
          </div>

          <label htmlFor="date" className="text-zinc-900 mt-2">
            Date:
          </label>
          <DatePicker
            id="date"
            selected={event.date ? new Date(event.date) : null}
            onChange={(date: Date | null) => setEvent({ ...event, date })}
            placeholderText={`📅 ${new Date().toLocaleDateString()}`}
            className="text-zinc-900 shadow-xl rounded-xl p-2"
          />

          <button type="submit" className="btn">
            Submit Event
          </button>
        </form>
      </Modal>
    </>
  );
};

export default EventForm;
