"use client";

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useToast } from "./ToastContext";

type EventData = {
  id?: string;
  name: string;
  location: string;
  date: Date | null;
  details: string;
  isRecurring: boolean;
  isFestival: boolean;
  email: string;
  timestamp?: string;
};

const initialEvent: EventData = {
  name: "",
  location: "",
  date: null,
  details: "",
  isRecurring: false,
  isFestival: false,
  email: "",
};

const inputClass =
  "mb-4 w-full rounded-2xl border-2 border-stone-400 p-2 text-stone-900 focus:border-green-600 focus:ring-2 focus:ring-green-600";
const labelClass = "mb-1 block font-bold text-stone-900";

function RadioGroup({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: "isRecurring" | "isFestival";
  value: boolean;
  onChange: (name: "isRecurring" | "isFestival", value: boolean) => void;
}) {
  const id = `${name}-label`;
  return (
    <div className="rounded-2xl border border-stone-300 bg-zinc-200 p-2 text-center">
      <span className="text-sm font-bold text-stone-900" id={id}>
        {label}
      </span>
      <div
        className="mt-2 flex justify-center gap-4"
        role="radiogroup"
        aria-labelledby={id}
      >
        {[true, false].map((v) => (
          <label
            key={String(v)}
            className="flex items-center gap-1 text-sm font-medium text-stone-800"
          >
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(name, v)}
              className={`size-4 ${v ? "accent-green-600" : "accent-red-500"}`}
            />
            {v ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function EventFormContent({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<EventData>(initialEvent);
  const [formErrors, setFormErrors] = useState("");

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEvent((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleRadioChange = useCallback(
    (name: "isRecurring" | "isFestival", value: boolean) => {
      setEvent((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const missing = [
        !event.name.trim() && "Event Name",
        !event.location.trim() && "Location",
        !event.details.trim() && "Details",
        !event.date && "Date",
      ].filter(Boolean);

      if (missing.length) {
        setFormErrors(`Missing required fields: ${missing.join(", ")}`);
        return;
      }

      setFormErrors("");
      setIsSubmitting(true);

      try {
        const eventData = {
          ...event,
          id: crypto.randomUUID(),
          timestamp: event.date?.toISOString() ?? "",
        };

        const response = await fetch("/api/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventData }),
        });

        const result = (await response.json()) as { success?: boolean };

        if (result.success) {
          try {
            const emailjs = (await import("@emailjs/browser")).default;
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
              {
                name: eventData.name,
                location: eventData.location,
                date: eventData.date?.toLocaleDateString() ?? "N/A",
                details: eventData.details,
                isRecurring: eventData.isRecurring ? "Yes" : "No",
                isFestival: eventData.isFestival ? "Yes" : "No",
                user_email: eventData.email || "No email provided",
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
            );
          } catch {
            // Email notification failed silently
          }

          showToast("Event submitted successfully!", "success");
          setEvent(initialEvent);
          onClose();
          return;
        }

        showToast("Submission failed. Please try again.", "error");
      } catch {
        showToast("Submission failed. Please try again.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [event, isSubmitting, showToast, onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-md"
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

          <label htmlFor="event-name" className={labelClass}>
            Event Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="event-name"
            name="name"
            value={event.name}
            onChange={handleChange}
            className={inputClass}
            required
            autoComplete="off"
            placeholder="e.g., The Comedy Store Open Mic"
          />

          <label htmlFor="event-location" className={labelClass}>
            Location (Full Address) <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="event-location"
            name="location"
            value={event.location}
            onChange={handleChange}
            className={inputClass}
            required
            autoComplete="off"
            placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA"
          />

          <fieldset className="mb-4 grid grid-cols-2 gap-4">
            <legend className="sr-only">Event options</legend>
            <RadioGroup
              label="Recurring?"
              name="isRecurring"
              value={event.isRecurring}
              onChange={handleRadioChange}
            />
            <RadioGroup
              label="Festival?"
              name="isFestival"
              value={event.isFestival}
              onChange={handleRadioChange}
            />
          </fieldset>

          <label htmlFor="event-details" className={labelClass}>
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
            className={`${inputClass} resize-y`}
            placeholder="Event Time, Frequency (if recurring), Host, Entry Fee, etc."
          />

          <label htmlFor="event-date" className={labelClass}>
            Date <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="event-date"
            type="date"
            required
            value={event.date?.toISOString().split("T")[0] ?? ""}
            onChange={(e) => {
              const dateStr = e.target.value;
              setEvent((prev) => ({
                ...prev,
                date: dateStr ? new Date(`${dateStr}T12:00:00`) : null,
              }));
            }}
            className={inputClass}
          />

          <label htmlFor="event-email" className={`${labelClass} text-sm`}>
            Email (Optional for Verification)
          </label>
          <input
            type="email"
            id="event-email"
            name="email"
            value={event.email}
            onChange={handleChange}
            className={`${inputClass} mb-6`}
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
