"use client";

import {
  useState,
  useCallback,
  useEffect,
  memo,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import { useToast } from "./ToastContext";
import CloseIcon from "./CloseIcon";
import type { EventSubmission, ApiResponse } from "../lib/types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  date: new Date(),
  details: "",
  isRecurring: false,
  isFestival: false,
  email: "",
};

// DRY Constants for repeated styling
const inputClass = "input-green mb-1";
const labelClass = "block text-xs font-bold uppercase opacity-70 mb-1";

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
    <div className="grid gap-2 rounded-2xl border border-stone-300 bg-stone-100/50 p-2 text-center">
      <span className="text-xs font-bold uppercase opacity-70" id={id}>
        {label}
      </span>

      <div
        className="grid grid-flow-col justify-center gap-4"
        role="radiogroup"
        aria-labelledby={id}
      >
        <label className="flex cursor-pointer items-center gap-1 text-sm font-bold">
          <input
            type="radio"
            name={name}
            checked={value}
            onChange={() => onChange(name, true)}
            className="size-4 accent-green-600"
          />
          Yes
        </label>

        <label className="flex cursor-pointer items-center gap-1 text-sm font-bold">
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

export default function EventFormContent({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleRadioChange = useCallback((name: RadioName, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const missing = [
        !form.name.trim() && "Name",
        !form.location.trim() && "Location",
        !form.details.trim() && "Details",
        !form.date && "Date",
      ].filter(Boolean);

      if (missing.length) {
        setFormError(`Required: ${missing.join(", ")}`);
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
          showToast(result.error ?? "Failed to submit.", "error");
          return;
        }

        showToast("Event submitted successfully!", "success");
        setForm(INITIAL_FORM_STATE);
        onClose();
      } catch {
        showToast("Submission failed.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isSubmitting, showToast, onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 p-2 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        /* panel-light handles bg, color, rounded-2xl, and shadow */
        className="panel-light relative grid max-h-[95dvh] w-full max-w-md gap-4 overflow-y-auto p-6"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 cursor-pointer transition-transform hover:scale-110"
          aria-label="Close modal"
        >
          <CloseIcon className="size-6" />
        </button>

        <header className="text-center">
          {/* h1 inherits global styles from global.css */}
          <h1 id="event-form-title" className="text-3xl">
            Event Form
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-red-600 uppercase">
            * Required fields
          </p>
        </header>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-2 text-center text-xs font-bold text-red-700"
          >
            {formError}
          </div>
        )}

        <div className="grid">
          <label htmlFor="event-name" className={labelClass}>
            Event Name *
          </label>
          <input
            type="text"
            id="event-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., The Comedy Store Open Mic"
          />
        </div>

        <div className="grid">
          <label htmlFor="event-location" className={labelClass}>
            Location (Address) *
          </label>
          <input
            type="text"
            id="event-location"
            name="location"
            value={form.location}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., 8433 Sunset Blvd, Los Angeles"
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
            label="Festival?"
            name="isFestival"
            value={form.isFestival}
            onChange={handleRadioChange}
          />
        </fieldset>

        <div className="grid">
          <label htmlFor="event-details" className={labelClass}>
            Details *
          </label>
          {form.isRecurring && (
            <p className="mb-1 text-[10px] font-bold text-red-600 italic">
              * Include Frequency (e.g. Weekly)
            </p>
          )}
          <textarea
            id="event-details"
            name="details"
            value={form.details}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Time, Host, Entry Fee, etc."
          />
        </div>

        <div className="grid">
          <label htmlFor="date" className={labelClass}>
            Date *
          </label>
          <DatePicker
            id="date"
            selected={form.date}
            onChange={(date: Date | null) =>
              setForm((prev) => ({ ...prev, date }))
            }
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            className="date-picker-input" /* Global class */
            calendarClassName="date-picker-calendar"
            showPopperArrow={false}
            showIcon
          />
        </div>

        <div className="grid">
          <label htmlFor="event-email" className={labelClass}>
            Email{" "}
            <span className="font-medium lowercase opacity-50">(optional)</span>
          </label>
          <input
            type="email"
            id="event-email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="yourname@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          /* btn-primary handles colors, hover, and shadow */
          className="btn-primary mt-2 w-full py-3 text-lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Event"}
        </button>
      </form>
    </div>
  );
}
