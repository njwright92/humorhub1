"use client";

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { getLatLng } from "../utils/geocode";
import { useToast } from "./ToastContext";

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
  onClose: () => void;
}

const EventFormContent: React.FC<EventFormContentProps> = ({ onClose }) => {
  const { showToast } = useToast();
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

      // --- Validation ---
      const missingFields: string[] = [];
      if (!event.name.trim()) missingFields.push("Event Name");
      if (!event.location.trim()) missingFields.push("Location");
      if (!event.details.trim()) missingFields.push("Details");
      if (!event.date) missingFields.push("Date");

      if (missingFields.length > 0) {
        setFormErrors(`Missing required fields: ${missingFields.join(", ")}`);
        return;
      }

      setFormErrors("");
      setIsSubmitting(true);

      try {
        let lat, lng;
        let finalEventData: EventData;
        let collectionName = "events";

        // --- Geocoding ---
        try {
          const response = await getLatLng(event.location);
          if (response && "lat" in response && "lng" in response) {
            lat = response.lat;
            lng = response.lng;
            finalEventData = prepareEventData(event, lat, lng);
          } else {
            throw new Error("Invalid coordinates");
          }
        } catch {
          console.warn("Geocoding failed, sending to manual review.");
          finalEventData = prepareEventData(event);
          collectionName = "events_manual_review";
        }

        // --- Submit to Server API ---
        const response = await fetch("/api/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventData: finalEventData,
            collectionName: collectionName,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // --- Lazy Load EmailJS ---
          try {
            const emailjs = (await import("@emailjs/browser")).default;
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
              {
                name: finalEventData.name,
                location: finalEventData.location,
                date: finalEventData.date
                  ? new Date(finalEventData.date).toLocaleDateString()
                  : "N/A",
                details: finalEventData.details,
                isRecurring: finalEventData.isRecurring ? "Yes" : "No",
                isFestival: finalEventData.isFestival ? "Yes" : "No",
                user_email: finalEventData.email || "No email provided",
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string,
            );
          } catch (emailError) {
            console.warn("EmailJS failed:", emailError);
          }

          showToast("Event submitted successfully!", "success");
          resetForm();
          onClose(); // Use prop to close
        } else {
          throw new Error(result.error);
        }
      } catch (submitError) {
        showToast("Submission failed. Please try again.", "error");
        console.error("Submission Error:", submitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [event, prepareEventData, isSubmitting, resetForm, showToast, onClose],
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-zinc-500 hover:text-red-600 transition-colors"
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
          className="w-full overflow-auto bg-zinc-200 p-6 rounded-lg shadow-2xl border-2 border-zinc-900"
        >
          {formErrors && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center text-sm font-bold">
              {formErrors}
            </div>
          )}

          <h1 className="text-3xl font-bold text-center text-zinc-900 mb-2 font-heading">
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
            className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
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
            className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
            required
            placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA"
            autoComplete="off"
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-100 p-2 rounded-lg text-center border border-zinc-300">
              <h6 className="text-zinc-900 font-bold text-sm">Recurring?</h6>
              <div className="flex justify-center gap-4 mt-2">
                <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={event.isRecurring === true}
                    onChange={() => handleCheckboxChange("isRecurring", true)}
                    className="accent-green-600 w-4 h-4"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={event.isRecurring === false}
                    onChange={() => handleCheckboxChange("isRecurring", false)}
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
                    checked={event.isFestival === true}
                    onChange={() => handleCheckboxChange("isFestival", true)}
                    className="accent-green-600 w-4 h-4"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-zinc-800 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={event.isFestival === false}
                    onChange={() => handleCheckboxChange("isFestival", false)}
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
            className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600 resize-y"
            placeholder="Event Time, Frequency (if recurring), Host, Entry Fee, etc."
          />

          <label htmlFor="date" className="block text-zinc-900 font-bold mb-1">
            Date *
          </label>
          <div className="mb-4 relative w-full">
            <input
              id="date"
              type="date"
              required
              value={event.date ? event.date.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const dateStr = e.target.value;
                setEvent({
                  ...event,
                  date: dateStr ? new Date(dateStr + "T12:00:00") : null,
                });
              }}
              className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600 cursor-pointer"
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
            className="text-zinc-900 border-2 border-zinc-400 rounded-lg p-2 w-full mb-6 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
            placeholder="yourname@example.com"
            autoComplete="email"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-zinc-950 font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventFormContent;
