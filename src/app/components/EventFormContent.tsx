"use client";

import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { getLatLng } from "../utils/geocode";
import { v4 as uuidv4 } from "uuid";
import emailjs from "@emailjs/browser";

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
  email?: string;
}

interface EventFormContentProps {
  initialOpen?: boolean;
}

// --- Helper Functions ---

const submitEvent = async (eventData: EventData) => {
  try {
    await addDoc(collection(db, "events"), eventData);
    return true;
  } catch (error) {
    console.error("Firestore Submission Error:", error);
    return false;
  }
};

const logManualReviewEvent = async (eventData: EventData, reason: string) => {
  try {
    await addDoc(collection(db, "events_manual_review"), {
      ...eventData,
      reason,
      submissionDate: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Manual Review Logging Error:", error);
    return false;
  }
};

const sendConfirmationEmail = async (eventData: EventData) => {
  if (!eventData.email) return;
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
      {
        name: eventData.name,
        location: eventData.location,
        date: eventData.date
          ? new Date(eventData.date).toLocaleDateString()
          : "N/A",
        details: eventData.details,
        isRecurring: eventData.isRecurring ? "Yes" : "No",
        isFestival: eventData.isFestival ? "Yes" : "No",
        user_email: eventData.email,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string,
    );
  } catch (error) {
    console.warn("EmailJS failed to send confirmation email.", error);
  }
};

// --- Main Component ---

const EventFormContent: React.FC<EventFormContentProps> = ({
  initialOpen = false,
}) => {
  // Initialize state with the prop passed from the Facade
  const [showModal, setShowModal] = useState(initialOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<EventData>({
    name: "",
    location: "",
    date: null,
    details: "",
    isRecurring: false,
    isFestival: false,
    email: "",
  });

  const [formErrors, setFormErrors] = useState<string>("");

  const resetForm = useCallback(() => {
    setEvent({
      name: "",
      location: "",
      date: null,
      details: "",
      isRecurring: false,
      isFestival: false,
      email: "",
    });
    setFormErrors("");
  }, []);

  const prepareEventData = useCallback(
    (currentEvent: EventData, lat?: number, lng?: number): EventData => {
      const id = uuidv4();
      const timestamp = currentEvent.date
        ? new Date(currentEvent.date).toISOString()
        : "";
      return {
        ...currentEvent,
        id,
        timestamp,
        lat,
        lng,
      };
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (!event.name || !event.location || !event.date || !event.details) {
        setFormErrors(
          "Please fill in all the required fields to submit your event.",
        );
        return;
      }

      setFormErrors("");
      setIsSubmitting(true);

      try {
        let lat, lng;
        let finalEventData: EventData;

        // 1. Geocoding
        try {
          const response = await getLatLng(event.location);
          if (response && "lat" in response && "lng" in response) {
            lat = response.lat;
            lng = response.lng;
            finalEventData = prepareEventData(event, lat, lng);

            const success = await submitEvent(finalEventData);
            if (!success)
              throw new Error("Firestore submission failed after geocoding.");
            alert(
              "Your event has been added successfully! Give it a few hours to appear.",
            );
          } else {
            throw new Error(
              "Geocoding failed or returned invalid coordinates.",
            );
          }
        } catch (geocodeError) {
          console.warn("Geocoding failed, logging for manual review.");
          finalEventData = prepareEventData(event);
          const logSuccess = await logManualReviewEvent(
            finalEventData,
            `Geocoding failed for: ${event.location}`,
          );

          if (logSuccess) {
            alert(
              "We couldn't verify the location. We've saved it for manual review and it should appear within 24 hours.",
            );
          } else {
            setFormErrors(
              "We couldn't verify the location OR save your event. Please try again later.",
            );
            setIsSubmitting(false);
            return;
          }
        }

        // 2. Email
        if (event.email) {
          await sendConfirmationEmail(finalEventData);
        }

        resetForm();
        setShowModal(false);
      } catch (submitError) {
        setFormErrors(
          "An unexpected error occurred. Please check your network and try again.",
        );
        console.error("Final Submission Error Path:", submitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [event, prepareEventData, isSubmitting, resetForm],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    },
    [],
  );

  const handleCheckboxChange = useCallback(
    (name: "isRecurring" | "isFestival", checked: boolean) => {
      setEvent((prevEvent) => ({ ...prevEvent, [name]: checked }));
    },
    [],
  );

  return (
    <>
      <button
        className="bg-green-600 hover:bg-green-700 text-black px-2 py-1 rounded-xl shadow-lg transform transition-transform hover:scale-105 font-bold text-lg tracking-wide"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
      >
        Add Event
      </button>

      {/* INLINE MODAL LOGIC */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-[110] text-zinc-500 hover:text-red-500 transition-colors"
              aria-label="Close Modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <form
              onSubmit={handleSubmit}
              className="form-container w-full overflow-auto bg-zinc-100 p-6 rounded-xl shadow-2xl border-2 border-zinc-200"
            >
              {formErrors && (
                <p className="text-red-600 font-bold mb-2 text-center">
                  {formErrors}
                </p>
              )}
              <h1 className="text-3xl font-bold text-center text-zinc-900 mb-2 font-comic">
                Event Form
              </h1>
              <p className="text-red-500 text-center mb-4 text-sm font-semibold">
                Please fill in all fields correctly.
              </p>

              <label
                htmlFor="eventName"
                className="block text-zinc-900 font-bold mb-1"
              >
                Event Name:
              </label>
              <input
                type="text"
                id="eventName"
                name="name"
                value={event.name}
                onChange={handleChange}
                className="text-zinc-900 border-2 border-zinc-300 rounded-lg p-2 w-full mb-4 focus:border-green-500 outline-none"
                required
                autoComplete="off"
                placeholder="e.g., The Comedy Store Open Mic"
              />

              <label
                htmlFor="location"
                className="block text-zinc-900 font-bold mb-1"
              >
                Location (Full Address):
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={event.location}
                onChange={handleChange}
                className="text-zinc-900 border-2 border-zinc-300 rounded-lg p-2 w-full mb-4 focus:border-green-500 outline-none"
                required
                placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA"
              />

              <label
                htmlFor="details"
                className="block text-zinc-900 font-bold mb-1"
              >
                Details:
              </label>
              <textarea
                id="details"
                name="details"
                value={event.details}
                onChange={handleChange}
                required
                autoComplete="off"
                rows={4}
                className="text-zinc-900 border-2 border-zinc-300 rounded-lg p-2 w-full mb-4 focus:border-green-500 outline-none resize-y"
                placeholder="Time, Host, Entry Fee, etc."
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-100 p-2 rounded-lg text-center">
                  <h6 className="text-zinc-900 font-bold text-sm">
                    Recurring?
                  </h6>
                  <div className="flex justify-center gap-4 mt-2">
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm">
                      <input
                        type="checkbox"
                        checked={event.isRecurring === true}
                        onChange={() =>
                          handleCheckboxChange("isRecurring", true)
                        }
                        className="accent-green-500 w-4 h-4"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm">
                      <input
                        type="checkbox"
                        checked={event.isRecurring === false}
                        onChange={() =>
                          handleCheckboxChange("isRecurring", false)
                        }
                        className="accent-red-500 w-4 h-4"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="bg-zinc-100 p-2 rounded-lg text-center">
                  <h6 className="text-zinc-900 font-bold text-sm">Festival?</h6>
                  <div className="flex justify-center gap-4 mt-2">
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm">
                      <input
                        type="checkbox"
                        checked={event.isFestival === true}
                        onChange={() =>
                          handleCheckboxChange("isFestival", true)
                        }
                        className="accent-green-500 w-4 h-4"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm">
                      <input
                        type="checkbox"
                        checked={event.isFestival === false}
                        onChange={() =>
                          handleCheckboxChange("isFestival", false)
                        }
                        className="accent-red-500 w-4 h-4"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <label
                htmlFor="date"
                className="block text-zinc-900 font-bold mb-1"
              >
                Date & Time:
              </label>
              <div className="mb-4">
                <DatePicker
                  id="date"
                  selected={event.date}
                  onChange={(date: Date | null) => setEvent({ ...event, date })}
                  placeholderText="Select Date & Time"
                  className="text-zinc-900 border-2 border-zinc-300 rounded-lg p-2 w-full focus:border-green-500 outline-none"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  showTimeSelect
                  timeCaption="Time"
                  wrapperClassName="w-full"
                />
              </div>

              <label
                htmlFor="email"
                className="block text-zinc-900 font-bold mb-1 text-sm"
              >
                Email (Optional for Verification):
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={event.email || ""}
                onChange={handleChange}
                className="text-zinc-900 border-2 border-zinc-300 rounded-lg p-2 w-full mb-6 focus:border-green-500 outline-none"
                placeholder="yourname@example.com"
              />

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-zinc-900 font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EventFormContent;
