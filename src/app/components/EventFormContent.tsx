"use client";

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
// 1. REMOVED: import { getLatLng } from "../utils/geocode";
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

export default function EventFormContent({ onClose }: EventFormContentProps) {
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

  // 2. UPDATED: No longer accepts lat/lng args, just prepares the ID and timestamp
  const prepareEventData = useCallback((currentEvent: EventData): EventData => {
    const id = crypto.randomUUID();
    const timestamp = currentEvent.date ? currentEvent.date.toISOString() : "";

    // We do NOT add lat/lng here anymore. The server does that.
    return { ...currentEvent, id, timestamp };
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

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
        // 3. SIMPLIFIED: Just prepare data, no geocoding here
        const finalEventData = prepareEventData(event);

        // 4. UPDATED: Send only eventData. Server determines collectionName.
        const response = await fetch("/api/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventData: finalEventData,
          }),
        });

        const result: unknown = await response.json();

        if (
          typeof result === "object" &&
          result !== null &&
          "success" in result &&
          (result as { success: unknown }).success === true
        ) {
          try {
            const emailjs = (await import("@emailjs/browser")).default;

            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
              {
                name: finalEventData.name,
                location: finalEventData.location,
                date: finalEventData.date
                  ? finalEventData.date.toLocaleDateString()
                  : "N/A",
                details: finalEventData.details,
                isRecurring: finalEventData.isRecurring ? "Yes" : "No",
                isFestival: finalEventData.isFestival ? "Yes" : "No",
                user_email: finalEventData.email || "No email provided",
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
            );
          } catch (emailError) {
            console.warn("EmailJS failed:", emailError);
          }

          showToast("Event submitted successfully!", "success");
          resetForm();
          onClose();
          return;
        }

        showToast("Submission failed. Please try again.", "error");
      } catch (submitError) {
        showToast("Submission failed. Please try again.", "error");
        console.error("Submission Error:", submitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [event, prepareEventData, isSubmitting, resetForm, showToast, onClose]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (name: "isRecurring" | "isFestival", checked: boolean) => {
      setEvent((prevEvent) => ({ ...prevEvent, [name]: checked }));
    },
    []
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-10 text-stone-900"
          aria-label="Close modal"
        >
          <svg
            className="size-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            focusable="false"
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
          className="w-full overflow-auto rounded-2xl border-2 border-stone-900 bg-zinc-200 p-6 shadow-lg"
        >
          {formErrors && (
            <div
              role="alert"
              className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-2 text-center text-sm font-bold text-red-700"
            >
              {formErrors}
            </div>
          )}

          <h1
            id="event-form-title"
            className="font-heading mb-2 text-center text-3xl font-bold text-stone-900"
          >
            Event Form
          </h1>

          <p
            className="mb-4 text-center text-sm font-semibold text-red-600"
            aria-hidden="true"
          >
            * Indicates required fields
          </p>

          <label
            htmlFor="event-name"
            className="mb-1 block font-bold text-stone-900"
          >
            Event Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="event-name"
            name="name"
            value={event.name}
            onChange={handleChange}
            className="mb-4 w-full rounded-2xl border-2 border-stone-400 p-2 text-stone-900 focus:border-green-600 focus:ring-2 focus:ring-green-600"
            required
            autoComplete="off"
            placeholder="e.g., The Comedy Store Open Mic"
          />

          <label
            htmlFor="event-location"
            className="mb-1 block font-bold text-stone-900"
          >
            Location (Full Address) <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="event-location"
            name="location"
            value={event.location}
            onChange={handleChange}
            className="mb-4 w-full rounded-2xl border-2 border-stone-400 p-2 text-stone-900 focus:border-green-600 focus:ring-2 focus:ring-green-600"
            required
            placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA"
            autoComplete="off"
          />

          <fieldset className="mb-4 grid grid-cols-2 gap-4">
            <legend className="sr-only">Event options</legend>

            <div className="rounded-2xl border border-stone-300 bg-zinc-200 p-2 text-center">
              <span
                className="text-sm font-bold text-stone-900"
                id="recurring-label"
              >
                Recurring?
              </span>
              <div
                className="mt-2 flex justify-center gap-4"
                role="radiogroup"
                aria-labelledby="recurring-label"
              >
                <label className="flex items-center gap-1 text-sm font-medium text-stone-800">
                  <input
                    type="radio"
                    name="isRecurring"
                    checked={event.isRecurring === true}
                    onChange={() => handleCheckboxChange("isRecurring", true)}
                    className="size-4 accent-green-600"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1 text-sm font-medium text-stone-800">
                  <input
                    type="radio"
                    name="isRecurring"
                    checked={event.isRecurring === false}
                    onChange={() => handleCheckboxChange("isRecurring", false)}
                    className="size-4 accent-red-500"
                  />
                  No
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-zinc-200 p-2 text-center">
              <span
                className="text-sm font-bold text-stone-900"
                id="festival-label"
              >
                Festival?
              </span>
              <div
                className="mt-2 flex justify-center gap-4"
                role="radiogroup"
                aria-labelledby="festival-label"
              >
                <label className="flex items-center gap-1 text-sm font-medium text-stone-800">
                  <input
                    type="radio"
                    name="isFestival"
                    checked={event.isFestival === true}
                    onChange={() => handleCheckboxChange("isFestival", true)}
                    className="size-4 accent-green-600"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1 text-sm font-medium text-stone-800">
                  <input
                    type="radio"
                    name="isFestival"
                    checked={event.isFestival === false}
                    onChange={() => handleCheckboxChange("isFestival", false)}
                    className="size-4 accent-red-500"
                  />
                  No
                </label>
              </div>
            </div>
          </fieldset>

          <label
            htmlFor="event-details"
            className="mb-1 block font-bold text-stone-900"
          >
            Details <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          {event.isRecurring && (
            <p className="mb-1 text-xs font-bold text-red-600" role="note">
              * Please include Frequency (e.g. Weekly)
            </p>
          )}
          <textarea
            id="event-details"
            name="details"
            value={event.details}
            onChange={handleChange}
            required
            autoComplete="off"
            rows={4}
            className="mb-4 w-full resize-y rounded-2xl border-2 border-stone-400 p-2 text-stone-900 focus:border-green-600 focus:ring-2 focus:ring-green-600"
            placeholder="Event Time, Frequency (if recurring), Host, Entry Fee, etc."
          />

          <label
            htmlFor="event-date"
            className="mb-1 block font-bold text-stone-900"
          >
            Date <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="event-date"
            type="date"
            required
            value={event.date ? event.date.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const dateStr = e.target.value;
              setEvent((prev) => ({
                ...prev,
                date: dateStr ? new Date(`${dateStr}T12:00:00`) : null,
              }));
            }}
            className="mb-4 w-full rounded-2xl border-2 border-stone-400 p-2 text-stone-900 focus:border-green-600 focus:ring-2 focus:ring-green-600"
          />

          <label
            htmlFor="event-email"
            className="mb-1 block text-sm font-bold text-stone-900"
          >
            Email (Optional for Verification)
          </label>
          <input
            type="email"
            id="event-email"
            name="email"
            value={event.email || ""}
            onChange={handleChange}
            className="mb-6 w-full rounded-2xl border-2 border-stone-400 p-2 text-stone-900 focus:border-green-600 focus:ring-2 focus:ring-green-600"
            placeholder="yourname@example.com"
            autoComplete="email"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-green-600 py-3 font-bold text-stone-900 shadow-lg transition-transform hover:scale-[1.02] hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
