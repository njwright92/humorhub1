"use client";

import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Assuming firebase.config exports db
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import Modal from "./modal";
// Assuming getLatLng is available in this path
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

// Define the function to submit the event to Firestore
const submitEvent = async (eventData: EventData) => {
  try {
    await addDoc(collection(db, "events"), eventData);
    return true;
  } catch (error) {
    console.error("Firestore Submission Error:", error);
    return false;
  }
};

// Function to log events that failed geocoding for manual review
const logManualReviewEvent = async (eventData: EventData, reason: string) => {
  try {
    // Log to a separate collection for staff review
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

// Function to send confirmation email using EmailJS
const sendConfirmationEmail = async (eventData: EventData) => {
  if (!eventData.email) return; // Skip if no email provided

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
    console.log("Email sent successfully!");
  } catch (error) {
    console.warn("EmailJS failed to send confirmation email.", error);
  }
};

// --- Component ---

const EventForm: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New: Prevent double submission
  const [event, setEvent] = useState<EventData>({
    name: "",
    location: "",
    date: null,
    details: "",
    isRecurring: false,
    isFestival: false, // Default to false
    email: "",
  });

  const [formErrors, setFormErrors] = useState<string>("");

  // Removed: const memoizedEvent = useMemo(() => event, [event]);

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

  // Updated handleSubmit function with robust error flow (like the previous successful version)
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

        // 1. Attempt Geocoding
        try {
          const response = await getLatLng(event.location);
          if (response && "lat" in response && "lng" in response) {
            lat = response.lat;
            lng = response.lng;
            finalEventData = prepareEventData(event, lat, lng);

            // 2. Submit to main collection
            const success = await submitEvent(finalEventData);
            if (!success) {
              throw new Error("Firestore submission failed after geocoding.");
            }
            alert(
              "Your event has been added successfully! Give it a few hours to appear.",
            );
          } else {
            // Geocoding failed to return valid coords, proceed to manual review log
            throw new Error(
              "Geocoding failed or returned invalid coordinates.",
            );
          }
        } catch (geocodeError) {
          // Geocoding failed, log for manual review
          console.warn(
            "Geocoding failed, logging for manual review:",
            geocodeError,
          );

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
              "We couldn't verify the location OR save your event for manual review. Please try again later.",
            );
            setIsSubmitting(false);
            return;
          }
        }

        // 3. Send confirmation email (regardless of success in main or review collection)
        if (event.email) {
          await sendConfirmationEmail(finalEventData);
        }

        // 4. Cleanup
        resetForm();
        setShowModal(false);
      } catch (submitError) {
        setFormErrors(
          "An unexpected error occurred during event submission. Please check your network and try again.",
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

  // Unified handler for checkboxes to prevent repetition
  const handleCheckboxChange = useCallback(
    (name: "isRecurring" | "isFestival", checked: boolean) => {
      setEvent((prevEvent) => ({ ...prevEvent, [name]: checked }));
    },
    [],
  );

  return (
    <>
      <button
        className="btn underline"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
      >
        Add Event
      </button>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <form
          onSubmit={handleSubmit}
          // The critical class is the one that styles the form content inside the Modal
          className="form-container mx-auto justify-center items-center overflow-auto max-h-[90vh] z-50 bg-white p-6 rounded-lg shadow-2xl"
        >
          {formErrors && <p className="text-red-500">{formErrors}</p>}
          <h1 className="text-2xl font-bold text-center text-black mt-4">
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
            className="text-zinc-900 shadow-xl rounded-lg p-2 w-full"
            required
            autoComplete="off"
            placeholder="e.g., The Comedy Store Open Mic" // 💡 Placeholder added
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
            className="text-zinc-900 shadow-xl rounded-lg p-2 w-full"
            required
            placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA 90069, USA" // 💡 Placeholder added
          />

          <label htmlFor="details" className="text-zinc-900">
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
            className="text-zinc-900 shadow-xl rounded-lg p-2 h-28 min-h-[6rem] block resize-y w-full"
            placeholder="e.g., Signup at 7:00 PM, show at 8:00 PM. Hosted by John Doe. Free entry." // 💡 Placeholder added
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
                // Check if true, not just non-false
                checked={event.isRecurring === true}
                onChange={() => handleCheckboxChange("isRecurring", true)}
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
                // Check if false
                checked={event.isRecurring === false}
                onChange={() => handleCheckboxChange("isRecurring", false)}
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
                checked={event.isFestival === true}
                onChange={() => handleCheckboxChange("isFestival", true)}
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
                checked={event.isFestival === false}
                onChange={() => handleCheckboxChange("isFestival", false)}
                className="shadow-xl rounded-lg p-2"
              />
            </div>
          </div>

          <label htmlFor="date" className="text-zinc-900 mt-2">
            Date:
          </label>
          <DatePicker
            id="date"
            selected={event.date}
            onChange={(date: Date | null) => setEvent({ ...event, date })}
            placeholderText={`📅 ${new Date().toLocaleDateString()}`}
            className="text-zinc-900 shadow-xl rounded-xl p-2 w-full"
            dateFormat="MM/dd/yyyy h:mm aa"
            showTimeSelect
            timeCaption="Time"
          />

          {/* Optional email field */}
          <h6 className="text-zinc-900 mt-4 mb-1 text-center text-xs">
            Optional: Provide your email for verification
          </h6>
          <p className="text-red-500 text-xs text-center mb-1">
            We&#39;ll send a confirmation if you&#39;d like to verify this event
            addition.
          </p>
          <label htmlFor="email" className="text-zinc-900">
            Email (optional):
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={event.email || ""}
            onChange={handleChange}
            className="text-zinc-900 shadow-xl rounded-lg p-2 mb-4 w-full"
            placeholder="yourname@example.com"
          />

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Event"}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default EventForm;
