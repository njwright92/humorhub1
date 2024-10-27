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
    alert(
      "Oops! Something went wrong while adding your event. Please try again later.",
    );
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

  const resetForm = () => {
    setEvent({
      name: "",
      location: "",
      date: null,
      details: "",
      isRecurring: false,
    });
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Validate form fields
      if (
        !memoizedEvent.name ||
        !memoizedEvent.location || // Ensure the location is filled out
        !memoizedEvent.date ||
        !memoizedEvent.details
      ) {
        setFormErrors(
          "Please fill in all the required fields to submit your event.",
        );
        return;
      }

      setFormErrors("");

      try {
        // Convert the address (location) to lat/lng using the geocoding function
        const response = await getLatLng(memoizedEvent.location);

        // Check if the geocoding response contains lat/lng
        if ("lat" in response && "lng" in response) {
          const { lat, lng } = response;

          // Prepare the event data with lat/lng
          const eventData: EventData = {
            ...memoizedEvent,
            lat,
            lng, // Add latitude and longitude to event data
          };

          // Submit the event with lat/lng
          await submitEvent(eventData);
        } else {
          // If geocoding fails, submit the event without lat/lng
          await submitEvent(memoizedEvent);
        }

        resetForm();
        setShowModal(false);
        alert(
          "Your event has been added successfully! You can view it on the events page. If you encounter any issues, feel free to email us.",
        );
      } catch (error) {
        // Attempt to submit the event without lat/lng, save it for manual review
        try {
          await addDoc(collection(db, "searchedCities"), memoizedEvent);
          resetForm();
          alert(
            "We couldn't verify the location. We'll review it manually and it should appear on the events page within 24 hours.",
          );
          setShowModal(false); // Close the modal after displaying the message
        } catch (dbError) {
          setFormErrors(
            "We couldn't save your event for manual review. Please try again later.",
          );
          setShowModal(false); // Close the modal even if there's an error
        }
      }
    },
    [memoizedEvent],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    },
    [],
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
