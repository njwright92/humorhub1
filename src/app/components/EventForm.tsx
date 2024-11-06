"use client";

import { useState, useCallback, useMemo, ChangeEvent, FormEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import Modal from "./modal";
import { getLatLng } from "../utils/geocode";
import { v4 as uuidv4 } from "uuid";

interface EventData {
  id?: string;
  name: string;
  location: string;
  date: Date | null;
  details: string;
  isRecurring: boolean;
  isFestival?: boolean;
  lat?: number;
  lng?: number;
  timestamp?: string;
}

const submitEvent = async (eventData: EventData) => {
  try {
    await addDoc(collection(db, "events"), eventData);
  } catch (error) {
    alert(
      "Oops! Something went wrong while adding your event. Please try again later."
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
    isFestival: undefined,
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
      isFestival: undefined,
    });
  };

  const prepareEventData = (event: EventData): EventData => {
    const id = uuidv4();
    const timestamp = event.date ? event.date.toISOString() : "";
    return {
      ...event,
      id,
      timestamp,
    };
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (
        !memoizedEvent.name ||
        !memoizedEvent.location ||
        !memoizedEvent.date ||
        !memoizedEvent.details
      ) {
        setFormErrors(
          "Please fill in all the required fields to submit your event."
        );
        return;
      }

      setFormErrors("");

      try {
        const response = await getLatLng(memoizedEvent.location);

        let lat, lng;
        if ("lat" in response && "lng" in response) {
          lat = response.lat;
          lng = response.lng;
        }

        const eventData = prepareEventData({
          ...memoizedEvent,
          lat,
          lng,
        });

        await submitEvent(eventData);
        resetForm();
        setShowModal(false);
        alert(
          "Your event has been added successfully! Give it a few hours to appear."
        );
      } catch (error) {
        try {
          await addDoc(collection(db, "events"), memoizedEvent);
          resetForm();
          alert(
            "We couldn't verify the location. We'll review it manually, and it should appear on the events page within 24 hours."
          );
          setShowModal(false);
        } catch (dbError) {
          setFormErrors(
            "We couldn't save your event for manual review. Please try again later."
          );
          setShowModal(false);
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
          className="form-container mx-auto justify-center items-center overflow-auto max-h-screen z-50"
        >
          {formErrors && <p className="text-red-500">{formErrors}</p>}
          <h1 className="text-2xl font-bold text-center text-black mt-4 ">
            Add Event Form
          </h1>
          <p className="text-red-500 text-center mb-1">
            Please fill in all fields correctly.
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

          <h6 className="text-zinc-900 mt-2">Is it a recurring event?:</h6>
          <p className="text-red-500 text-sm">
            If yes specify day of the week in details.
          </p>
          <div className="flex flex-row justify-center space-x-8">
            <div className="flex flex-col items-center text-center">
              <label htmlFor="isRecurringYes" className="text-zinc-900">
                Yes
              </label>
              <input
                type="checkbox"
                id="isRecurringYes"
                name="isRecurring"
                aria-checked={event.isRecurring === true}
                onChange={() => setEvent({ ...event, isRecurring: true })}
                className="shadow-xl rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <label htmlFor="isRecurringNo" className="text-zinc-900">
                No
              </label>
              <input
                type="checkbox"
                id="isRecurringNo"
                name="isRecurring"
                aria-checked={event.isRecurring === false}
                onChange={() => setEvent({ ...event, isRecurring: false })}
                className="shadow-xl rounded-lg p-2"
              />
            </div>
          </div>
          <h6 className="text-zinc-900 mt-6">
            Is it a festival or competition?
          </h6>
          <p className="text-red-500 text-sm">
            Check if this event is a festival or competition.
          </p>
          <div className="flex flex-row justify-center space-x-8">
            <div className="flex flex-col items-center text-center">
              <label htmlFor="isFestivalYes" className="text-zinc-900">
                Yes
              </label>
              <input
                type="checkbox"
                id="isFestivalYes"
                name="isFestival"
                aria-checked={event.isFestival === true}
                onChange={() => setEvent({ ...event, isFestival: true })}
                className="shadow-xl rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <label htmlFor="isFestivalNo" className="text-zinc-900">
                No
              </label>
              <input
                type="checkbox"
                id="isFestivalNo"
                name="isFestival"
                aria-checked={event.isFestival === false}
                onChange={() => setEvent({ ...event, isFestival: false })}
                className="shadow-xl rounded-lg p-2"
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
