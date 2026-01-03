"use client";

import { useState, useCallback } from "react";
import { useToast } from "../components/ToastContext";

interface FormState {
  name: string;
  email: string;
  message: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  message: "",
};

const inputClass =
  "w-full rounded-2xl border-2 border-stone-500 px-4 py-3 shadow-lg placeholder:text-stone-500 transition-all focus:border-amber-700 focus:ring-2 focus:ring-amber-700/50";
const labelClass = "mb-2 mt-2 text-xs uppercase md:text-sm";

export default function ContactForm() {
  const { showToast } = useToast();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const emailjs = (await import("@emailjs/browser")).default;
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID1!,
          {
            name: formState.name,
            email: formState.email,
            message: formState.message,
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
        showToast("Message sent! We'll get back to you soon.", "success");
        setFormState(INITIAL_FORM_STATE);
      } catch {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, isSubmitting, showToast]
  );

  return (
    <section
      aria-labelledby="contact-form-heading"
      className="animate-slide-in mx-auto w-full max-w-4xl rounded-2xl border-2 border-amber-700 bg-stone-800 p-2 shadow-lg backdrop-blur-md md:p-4 lg:p-6"
    >
      <h2 id="contact-form-heading" className="sr-only">
        Contact Form
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 text-left sm:gap-6"
        noValidate
      >
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="contact-name" className={labelClass}>
              Name <span className="sr-only">(required)</span>
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              placeholder="Your Name"
              required
              autoComplete="name"
              value={formState.name}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="contact-email" className={labelClass}>
              Email <span className="sr-only">(required)</span>
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={formState.email}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid gap-1">
          <label htmlFor="contact-message" className={labelClass}>
            Message <span className="sr-only">(required)</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="How can we help you?"
            required
            rows={5}
            autoComplete="off"
            value={formState.message}
            onChange={handleInputChange}
            className={`${inputClass} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-amber-700 px-4 py-2 font-bold shadow-lg transition-transform hover:scale-105 hover:bg-amber-600 disabled:scale-100 disabled:bg-stone-600 disabled:text-stone-400 sm:w-auto"
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>
      </form>
    </section>
  );
}
