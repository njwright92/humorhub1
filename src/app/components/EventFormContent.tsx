"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import { useToast } from "./ToastContext";
import CloseIcon from "./CloseIcon";
import type { EventSubmission, ApiResponse } from "../lib/types";

interface FormState {
  name: string;
  location: string;
  date: Date | null;
  details: string;
  isRecurring: boolean;
  isFestival: boolean;
  isOther: boolean;
  email: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  location: "",
  date: new Date(),
  details: "",
  isRecurring: false,
  isFestival: false,
  isOther: false,
  email: "",
};

const inputClass = "input-green mb-1";
const labelClass = "block text-xs font-bold uppercase opacity-70 mb-1";

type RadioName = "isRecurring" | "isFestival" | "isOther";

function formatDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}

function formatNativeDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseNativeDateInput(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

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
    isOther: form.isOther,
    email: form.email.trim(),
    timestamp: dateIso,
  };
}

export default function EventFormContent({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState("");

  const [dateInputValue, setDateInputValue] = useState(() =>
    formatDateInput(new Date()),
  );
  const nativeDateInputRef = useRef<HTMLInputElement>(null);

  const nativeDateInputValue = form.date
    ? formatNativeDateInput(form.date)
    : "";

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

  const handleDateSelect = useCallback((date: Date) => {
    setForm((prev) => ({ ...prev, date }));
    setDateInputValue(formatDateInput(date));
  }, []);

  const handleDateTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const prev = dateInputValue;
      const isDeleting = raw.length < prev.length;

      if (isDeleting) {
        setDateInputValue(raw);
        return;
      }

      const digits = raw.replace(/\D/g, "");

      let formatted = "";
      if (digits.length <= 2) {
        formatted = digits;
      } else if (digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      }

      setDateInputValue(formatted);

      const nextDate = parseDateInput(formatted);
      if (nextDate) {
        setForm((prev) => ({ ...prev, date: nextDate }));
      }
    },
    [dateInputValue],
  );

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
        setDateInputValue(formatDateInput(new Date()));
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
      className="fixed inset-0 z-50 grid place-items-center bg-stone-900/70 p-2 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        className="panel-light relative grid max-h-[95dvh] w-full max-w-md gap-4 overflow-y-auto p-6"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 transition-transform hover:scale-110"
          aria-label="Close modal"
        >
          <CloseIcon className="light-close size-7" />
        </button>

        <header className="text-center">
          <h1 id="event-form-title" className="text-3xl">
            Event Form
          </h1>
          <p className="m-1 text-xs font-bold tracking-widest text-red-600">
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
            autoComplete="false"
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
            autoComplete="false"
          />
        </div>

        <fieldset className="grid grid-cols-3 gap-2">
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
          <RadioGroup
            label="Music/Arts?"
            name="isOther"
            value={form.isOther}
            onChange={handleRadioChange}
          />
        </fieldset>

        <div className="grid">
          <label htmlFor="event-details" className={labelClass}>
            Details *
          </label>
          {form.isRecurring && (
            <p className="mb-1 text-xs font-bold text-red-600 italic">
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
            autoComplete="false"
          />
        </div>

        <div className="grid">
          <label htmlFor="event-date-text" className={labelClass}>
            Date *
          </label>
          <div className="relative">
            <input
              id="event-date-text"
              type="text"
              inputMode="numeric"
              placeholder="MM/DD/YYYY"
              value={dateInputValue}
              onChange={handleDateTextChange}
              onBlur={() => {
                if (form.date) setDateInputValue(formatDateInput(form.date));
              }}
              className={`${inputClass} pr-12`}
              autoComplete="off"
            />

            <div className="absolute top-1/2 right-2 size-8 -translate-y-1/2">
              <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg text-stone-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>

              <input
                ref={nativeDateInputRef}
                type="date"
                value={nativeDateInputValue}
                onChange={(event) => {
                  const nextDate = parseNativeDateInput(event.target.value);
                  if (nextDate) handleDateSelect(nextDate);
                }}
                aria-label="Open calendar"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
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
            autoComplete="true"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mx-auto mt-2 w-2/3"
        >
          {isSubmitting ? "Submitting..." : "Submit Event"}
        </button>
      </form>
    </div>
  );
}
