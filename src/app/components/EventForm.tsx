"use client";

import { useState, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import Modal from "./modal";

const submitEvent = async (eventData: EventData) => {
  try {
    await addDoc(collection(db, "events"), eventData);
  } catch (error) {
    console.error("Error adding event: ", error);
  }
};

interface EventData {
  name: string;
  location: string;
  date: Date | null;
  lat: number;
  lng: number;
  details: string;
  isRecurring: boolean;
}

const EventForm: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [event, setEvent] = useState<EventData>({
    name: "",
    location: "",
    date: null,
    lat: 0,
    lng: 0,
    details: "",
    isRecurring: false,
  });

  const [formErrors, setFormErrors] = useState<string>("");

  const memoizedEvent = useMemo(() => event, [event]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

      setFormErrors("");
      try {
        await submitEvent(memoizedEvent);
        setShowModal(false);
        alert(
          "Event has been added successfully! Check the events page to view! Email me with any issues."
        );
      } catch (error) {
        console.error("Error adding event: ", error);
        setFormErrors("Failed to add the event. Please try again.");
      }
    },
    [memoizedEvent]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      if (name === "lat" || name === "lng") {
        const numberValue = value === "" ? 0 : parseFloat(value);
        setEvent((prevEvent) => ({ ...prevEvent, [name]: numberValue }));
      } else {
        setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
      }
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
          <label htmlFor="eventName" className="the-text">
            Event Name:
          </label>
          <input
            type="text"
            id="eventName"
            name="name"
            value={event.name}
            onChange={handleChange}
            className="standard-input"
            required
            autoComplete="off"
          />

          <label htmlFor="location" className="the-text">
            Location must include city state abbr ex(Spokane WA):
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={event.location}
            onChange={handleChange}
            className="standard-input"
            required
          />

          <label htmlFor="details" className="the-text">
            Details:
          </label>
          <textarea
            id="details"
            name="details"
            value={event.details}
            onChange={handleChange}
            className="standard-input"
            required
            autoComplete="off"
          />

          <label htmlFor="latitude" className="the-text">
            Latitude **Get coordinates from Google Maps**:
          </label>
          <input
            type="number"
            id="latitude"
            name="lat"
            value={event.lat}
            onChange={handleChange}
            className="standard-input"
            autoComplete="off"
            required
          />

          <label htmlFor="longitude" className="the-text">
            Longitude **Get coordinates from Google Maps**:
          </label>
          <input
            type="number"
            id="longitude"
            name="lng"
            value={event.lng}
            onChange={handleChange}
            className="standard-input"
            required
            autoComplete="off"
          />
          <h6 className="the-text">Is it a recurring event?:</h6>
          <p className="text-red-500">
            If yes specify day of the week in details.
          </p>
          <div className="flex flex-row">
            <div className="flex flex-col items-center mr-4">
              <label htmlFor="isRecurringYes" className="the-text">
                Yes
              </label>
              <input
                type="checkbox"
                id="isRecurringYes"
                name="isRecurring"
                checked={event.isRecurring === true}
                onChange={() => setEvent({ ...event, isRecurring: true })}
                className="standard-input"
              />
            </div>

            <div className="flex flex-col items-center">
              <label htmlFor="isRecurringNo" className="the-text">
                No
              </label>
              <input
                type="checkbox"
                id="isRecurringNo"
                name="isRecurring"
                checked={event.isRecurring === false}
                onChange={() => setEvent({ ...event, isRecurring: false })}
                className="standard-input"
              />
            </div>
          </div>

          <label htmlFor="date" className="the-text mt-2">
            Date:
          </label>
          <DatePicker
            id="date"
            selected={event.date ? new Date(event.date) : null}
            onChange={(date: Date | null) => setEvent({ ...event, date })}
            placeholderText={`📅 ${new Date().toLocaleDateString()}`}
            className="standard-input text-black"
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
