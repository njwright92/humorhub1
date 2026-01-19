"use client";

import {
  useState,
  useCallback,
  useEffect,
  memo,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useToast } from "./ToastContext";
import type { EventSubmission, ApiResponse } from "../lib/types";

interface FormState {
  name: string;
  location: string;
  date: Date | null;
  details: string;
  isRecurring: boolean;
  isFestival: boolean;
  email: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  location: "",
  date: null,
  details: "",
  isRecurring: false,
  isFestival: false,
  email: "",
};

const inputClass = "mb-4 input-green";
const labelClass = "mb-1 block font-bold text-stone-900";

type RadioName = "isRecurring" | "isFestival";

const RadioGroup = memo(function RadioGroup({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: RadioName;
  value: boolean;
  onChange: (name: RadioName, value: boolean) => void;
}) {
  const id = `${name}-label`;
  return (
    <div className="grid gap-2 rounded-2xl border border-stone-300 bg-zinc-200 p-2 text-center">
      <span className="text-sm font-bold text-stone-900" id={id}>
        {label}
      </span>
      <div
        className="grid grid-flow-col justify-center gap-4"
        role="radiogroup"
        aria-labelledby={id}
      >
        <label className="grid grid-flow-col items-center gap-1 text-sm font-medium text-stone-800">
          <input
            type="radio"
            name={name}
            checked={value}
            onChange={() => onChange(name, true)}
            className="size-4 accent-green-600"
          />
          Yes
        </label>
        <label className="grid grid-flow-col items-center gap-1 text-sm font-medium text-stone-800">
          <input
            type="radio"
            name={name}
            checked={!value}
            onChange={() => onChange(name, false)}
            className="size-4 accent-red-500"
          />
          No
        </label>
      </div>
    </div>
  );
});

function CloseIcon() {
  return (
    <svg
      className="size-8"
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
  );
}

function buildSubmission(form: FormState): EventSubmission {
  const dateIso = form.date?.toISOString() ?? "";
  return {
    id: crypto.randomUUID(),
    name: form.name.trim(),
    location: form.location.trim(),
    date: dateIso || null,
    details: form.details.trim(),
    isRecurring: form.isRecurring,
    isFestival: form.isFestival,
    email: form.email.trim(),
    timestamp: dateIso,
  };
}

async function sendEmailNotification(
  data: EventSubmission,
  originalDate: Date | null
) {
  const emailjs = (await import("@emailjs/browser")).default;
  await emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    {
      name: data.name,
      location: data.location,
      date: originalDate?.toLocaleDateString() ?? "N/A",
      details: data.details,
      isRecurring: data.isRecurring ? "Yes" : "No",
      isFestival: data.isFestival ? "Yes" : "No",
      user_email: data.email || "No email provided",
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}

export default function EventFormContent({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleRadioChange = useCallback((name: RadioName, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setForm((prev) => ({
      ...prev,
      date: dateStr ? new Date(`${dateStr}T12:00:00`) : null,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const missing = [
        !form.name.trim() && "Event Name",
        !form.location.trim() && "Location",
        !form.details.trim() && "Details",
        !form.date && "Date",
      ].filter(Boolean);

      if (missing.length) {
        setFormError(`Missing required fields: ${missing.join(", ")}`);
        return;
      }

      setFormError("");
      setIsSubmitting(true);

      try {
        const submission = buildSubmission(form);

        const response = await fetch("/api/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventData: submission }),
        });

        const result: ApiResponse = await response.json();

        if (!result.success) {
          showToast(
            result.error ?? "Submission failed. Please try again.",
            "error"
          );
          return;
        }

        // Fire and forget - don't await
        sendEmailNotification(submission, form.date).catch(() => {});

        showToast("Event submitted successfully!", "success");
        setForm(INITIAL_FORM_STATE);
        onClose();
      } catch {
        showToast("Submission failed. Please try again.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isSubmitting, showToast, onClose]
  );

  const dateValue = form.date?.toISOString().split("T")[0] ?? "";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-2 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        className="card-base-2 relative grid max-h-[90vh] w-full max-w-md gap-3 overflow-auto border-stone-900 bg-zinc-200 p-4"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-stone-900"
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>

        {formError && (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 px-4 py-2 text-center text-sm font-bold text-red-700"
          >
            {formError}
          </div>
        )}

        <header className="grid gap-1 text-center">
          <h1 id="event-form-title" className="text-3xl text-stone-900">
            Event Form
          </h1>
          <p className="text-sm font-semibold text-red-600" aria-hidden="true">
            * Required fields
          </p>
        </header>

        <div className="grid gap-1">
          <label htmlFor="event-name" className={labelClass}>
            Event Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="event-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            required
            autoComplete="off"
            placeholder="e.g., The Comedy Store Open Mic"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="event-location" className={labelClass}>
            Location (Full Address) <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            type="text"
            id="event-location"
            name="location"
            value={form.location}
            onChange={handleChange}
            className={inputClass}
            required
            autoComplete="off"
            placeholder="e.g., 8433 Sunset Blvd, Los Angeles, CA"
          />
        </div>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="sr-only">Event options</legend>
          <RadioGroup
            label="Recurring?"
            name="isRecurring"
            value={form.isRecurring}
            onChange={handleRadioChange}
          />
          <RadioGroup
            label="isFestival"
            name="isFestival"
            value={form.isFestival}
            onChange={handleRadioChange}
          />
        </fieldset>

        <div className="grid gap-1">
          <label htmlFor="event-details" className={labelClass}>
            Details <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          {form.isRecurring && (
            <p className="text-xs font-bold text-red-600" role="note">
              * Please include Frequency (e.g. Weekly)
            </p>
          )}
          <textarea
            id="event-details"
            name="details"
            value={form.details}
            onChange={handleChange}
            required
            autoComplete="off"
            rows={4}
            className={`${inputClass} resize-y`}
            placeholder="Event Time, Frequency (if recurring), Host, Entry Fee, etc."
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="event-date" className={labelClass}>
            Date <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="event-date"
            type="date"
            required
            value={dateValue}
            onChange={handleDateChange}
            className={inputClass}
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="event-email" className={labelClass}>
            Email
            <br />
            <span className="text-xs text-amber-700">
              (optional) if you want to be notified when the event is added.
            </span>
          </label>
          <input
            type="email"
            id="event-email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="yourname@example.com"
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-green-600 py-3 font-bold text-stone-900 shadow-xl transition-transform hover:scale-105 hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Event"}
        </button>
      </form>
    </div>
  );
}
