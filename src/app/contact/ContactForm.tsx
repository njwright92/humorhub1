"use client";

import { useCallback, useState } from "react";
type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

// Shared styles
const inputClass =
  "w-full rounded-2xl shadow-lg border-2 border-stone-500 bg-stone-900 px-4 py-3 text-zinc-200 placeholder:text-stone-500 transition-all focus:border-amber-700 focus:ring-2 focus:ring-amber-700/50";

const labelClass =
  "mb-2 text-xs font-bold uppercase tracking-wider text-zinc-200";

export default function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Lazy load EmailJS only when submitting
      const emailjs = await import("@emailjs/browser");

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

      setSubmitStatus("success");
      setFormState({ name: "", email: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto w-full max-w-4xl">
      <section
        aria-labelledby="contact-form-heading"
        className="rounded-2xl border-2 border-amber-700 bg-stone-800/80 p-4 shadow-lg shadow-amber-700 backdrop-blur-sm sm:p-6 md:p-8"
      >
        <h2 id="contact-form-heading" className="sr-only">
          Contact Form
        </h2>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div
            role="alert"
            className="animate-slide-in mb-6 rounded-2xl border border-green-500/50 bg-green-900/30 px-4 py-3 text-center font-semibold text-green-200"
          >
            <span aria-hidden="true">✓ </span>
            Message sent successfully! We&#39;ll get back to you soon.
          </div>
        )}
        {submitStatus === "error" && (
          <div
            role="alert"
            className="animate-slide-in mb-6 rounded-2xl border border-red-500/50 bg-red-900/30 px-4 py-3 text-center font-semibold text-red-200"
          >
            <span aria-hidden="true">✗ </span>
            Something went wrong. Please try again later.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-left sm:space-y-6"
          noValidate
        >
          {/* Name & Email */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <label htmlFor="contact-name" className={labelClass}>
                Name <span className="sr-only">(required)</span>
              </label>
              <input
                type="text"
                id="contact-name"
                name="name"
                placeholder="Your Name"
                required
                aria-required="true"
                autoComplete="name"
                value={formState.name}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="contact-email" className={labelClass}>
                Email <span className="sr-only">(required)</span>
              </label>
              <input
                type="email"
                id="contact-email"
                name="email"
                placeholder="you@example.com"
                required
                aria-required="true"
                autoComplete="email"
                value={formState.email}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <label htmlFor="contact-message" className={labelClass}>
              Message <span className="sr-only">(required)</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="How can we help you?"
              required
              aria-required="true"
              rows={5}
              autoComplete="off"
              value={formState.message}
              onChange={handleInputChange}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-amber-700 px-8 py-3 text-base font-bold text-zinc-200 shadow-lg transition-transform hover:scale-105 hover:bg-amber-600 disabled:scale-100 disabled:bg-stone-600 disabled:text-stone-400 sm:w-auto sm:text-lg"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
