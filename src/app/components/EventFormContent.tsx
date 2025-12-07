"use client";

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { getLatLng } from "../utils/geocode";
import emailjs from "@emailjs/browser";
import { useToast } from "./ToastContext"; // ✅ Add this

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
        user_email: eventData.email || "No email provided",
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
  const { showToast } = useToast(); // ✅ Add this
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
      const id = crypto.randomUUID();
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

      // --- Validation Logic ---
      const missingFields: string[] = [];
      if (!event.name.trim()) missingFields.push("Event Name");
      if (!event.location.trim()) missingFields.push("Location");
      if (!event.details.trim()) missingFields.push("Details");
      if (!event.date) missingFields.push("Date");

      if (missingFields.length > 0) {
        setFormErrors(`Missing required fields: ${missingFields.join(", ")}`);
        const formContainer = document.querySelector(".form-container");
        if (formContainer) formContainer.scrollTop = 0;
        return;
      }

      setFormErrors("");
      setIsSubmitting(true);

      try {
        let lat, lng;
        let finalEventData: EventData;
        let submissionSuccess = false;

        // --- Geocoding & Submission ---
        try {
          const response = await getLatLng(event.location);

          if (response && "lat" in response && "lng" in response) {
            lat = response.lat;
            lng = response.lng;
            finalEventData = prepareEventData(event, lat, lng);

            const success = await submitEvent(finalEventData);
            if (success) submissionSuccess = true;
          } else {
            throw new Error("Invalid coordinates");
          }
        } catch {
          console.warn("Geocoding failed, sending to manual review.");
          finalEventData = prepareEventData(event);

          const logSuccess = await logManualReviewEvent(
            finalEventData,
            `Geocoding failed for: ${event.location}`,
          );

          if (logSuccess) submissionSuccess = true;
        }

        if (submissionSuccess) {
          await sendConfirmationEmail(finalEventData!);

          // ✅ Replace alert with toast
          showToast("Event submitted successfully!", "success");
          resetForm();
          setShowModal(false);
        } else {
          // ✅ Replace setFormErrors with toast for critical errors
          showToast("Failed to save event. Please try again.", "error");
        }
      } catch (submitError) {
        showToast("Network error. Please try again.", "error");
        console.error("Final Submission Error Path:", submitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [event, prepareEventData, isSubmitting, resetForm, showToast],
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
        className="bg-green-600 hover:bg-green-700 text-zinc-950 px-2 py-1 rounded-lg shadow-lg transform transition-transform hover:scale-105 font-bold text-lg tracking-wide"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
      >
        Add Your Event
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-110 text-zinc-500 hover:text-red-600 transition-colors"
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
              noValidate
              className="form-container w-full overflow-auto bg-zinc-200 p-6 rounded-lg shadow-2xl border-2 border-zinc-900"
            >
              {formErrors && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center text-sm font-bold">
                  {formErrors}
                </div>
              )}
              <h1 className="text-3xl font-bold text-center text-zinc-900 mb-2 font-comic">
                Event Form
              </h1>
              <p className="text-red-600 text-center mb-4 text-sm font-semibold">
                * Indicates required fields
              </p>

              <label
                htmlFor="eventName"
                className="block text-zinc-900 font-bold mb-1"
              >
                Event Name *
              </label>
              <input
                type="text"
                id="eventName"
                name="name"
                value={event.name}
                onChange={handleChange}
                className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-4 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                required
                autoComplete="off"
                placeholder="e.g., The Comedy Store Open Mic"
              />

              <label
                htmlFor="location"
                className="block text-zinc-900 font-bold mb-1"
              >
                Location (Full Address) *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={event.location}
                onChange={handleChange}
                className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-4 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                required
                placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA"
                autoComplete="off"
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-100 p-2 rounded-lg text-center border border-zinc-300">
                  <h6 className="text-zinc-900 font-bold text-sm">
                    Recurring?
                  </h6>
                  <div className="flex justify-center gap-4 mt-2">
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                      <input
                        type="checkbox"
                        id="isRecurring-yes"
                        name="isRecurring"
                        checked={event.isRecurring === true}
                        onChange={() =>
                          handleCheckboxChange("isRecurring", true)
                        }
                        className="accent-green-600 w-4 h-4"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                      <input
                        type="checkbox"
                        id="isRecurring-no"
                        name="isRecurring"
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

                <div className="bg-zinc-100 p-2 rounded-lg text-center border border-zinc-300">
                  <h6 className="text-zinc-900 font-bold text-sm">Festival?</h6>
                  <div className="flex justify-center gap-4 mt-2">
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                      <input
                        type="checkbox"
                        id="isFestival-yes"
                        name="isFestival"
                        checked={event.isFestival === true}
                        onChange={() =>
                          handleCheckboxChange("isFestival", true)
                        }
                        className="accent-green-600 w-4 h-4"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                      <input
                        type="checkbox"
                        id="isFestival-no"
                        name="isFestival"
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
                htmlFor="details"
                className="block text-zinc-900 font-bold mb-1"
              >
                Details *
              </label>
              {event.isRecurring && (
                <p className="text-xs text-red-600 font-bold mb-1">
                  * Please include Frequency (e.g. Weekly)
                </p>
              )}
              <textarea
                id="details"
                name="details"
                value={event.details}
                onChange={handleChange}
                required
                autoComplete="off"
                rows={4}
                className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-4 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600 resize-y"
                placeholder="Event Time, Frequency (if recurring), Host, Entry Fee, etc."
              />

              <label
                htmlFor="date"
                className="block text-zinc-900 font-bold mb-1"
              >
                Date *
              </label>
              <div className="mb-4 relative w-full">
                <input
                  id="date"
                  type="date"
                  required
                  value={
                    event.date ? event.date.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    setEvent({
                      ...event,
                      date: dateStr ? new Date(dateStr + "T12:00:00") : null,
                    });
                  }}
                  className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600 cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 90 90"
                  fill="currentColor"
                  className="h-6 w-6 text-zinc-600 absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none z-10"
                >
                  <path d="M 90 23.452 v -3.892 c 0 -6.074 -4.942 -11.016 -11.017 -11.016 H 68.522 V 4.284 c 0 -1.657 -1.343 -3 -3 -3 s -3 1.343 -3 3 v 4.261 H 27.477 V 4.284 c 0 -1.657 -1.343 -3 -3 -3 s -3 1.343 -3 3 v 4.261 H 11.016 C 4.942 8.545 0 13.487 0 19.561 v 3.892 H 90 z" />
                  <path d="M 0 29.452 V 75.7 c 0 6.074 4.942 11.016 11.016 11.016 h 67.967 C 85.058 86.716 90 81.775 90 75.7 V 29.452 H 0 z M 25.779 72.18 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 72.18 25.779 72.18 z M 25.779 58.816 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 58.816 25.779 58.816 z M 25.779 45.452 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 27.436 45.452 25.779 45.452 z M 48.688 72.18 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 72.18 48.688 72.18 z M 48.688 58.816 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 58.816 48.688 58.816 z M 48.688 45.452 h -7.375 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.375 c 1.657 0 3 1.343 3 3 S 50.345 45.452 48.688 45.452 z M 71.597 72.18 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 72.18 71.597 72.18 z M 71.597 58.816 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 58.816 71.597 58.816 z M 71.597 45.452 h -7.376 c -1.657 0 -3 -1.343 -3 -3 s 1.343 -3 3 -3 h 7.376 c 1.657 0 3 1.343 3 3 S 73.254 45.452 71.597 45.452 z" />
                </svg>
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
                className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-6 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                placeholder="yourname@example.com"
                autoComplete="email"
              />

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-zinc-950 font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02]"
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
