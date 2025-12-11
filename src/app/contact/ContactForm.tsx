"use client";

import React, { useCallback, useState } from "react";
import emailjs from "@emailjs/browser";
import Link from "next/link";

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prevState) => ({ ...prevState, [name]: value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Lazy load EmailJS only when submitting
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID1 as string,
        {
          name: formState.name,
          email: formState.email,
          message: formState.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string,
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
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <section className="bg-zinc-800/80 border-2 border-amber-300/20 shadow-2xl shadow-amber-900/10 rounded-xl p-8 backdrop-blur-sm">
        {/* STATUS MESSAGES */}
        {submitStatus === "success" && (
          <div
            role="alert"
            className="bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6 text-center font-semibold animate-slide-in"
          >
            ✓ Message sent successfully! We&#39;ll get back to you soon.
          </div>
        )}
        {submitStatus === "error" && (
          <div
            role="alert"
            className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-center font-semibold animate-slide-in"
          >
            ✗ Something went wrong. Please try again later.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* NAME & EMAIL GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="contact-name"
                className="mb-2 text-xs font-bold text-amber-300 uppercase tracking-wider"
              >
                Name
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
                className="bg-zinc-900 border-2 border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="contact-email"
                className="mb-2 text-xs font-bold text-amber-300 uppercase tracking-wider"
              >
                Email
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
                className="bg-zinc-900 border-2 border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all"
              />
            </div>
          </div>

          {/* MESSAGE */}
          <div className="flex flex-col">
            <label
              htmlFor="contact-message"
              className="mb-2 text-xs font-bold text-amber-300 uppercase tracking-wider"
            >
              Message
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
              className="bg-zinc-900 border-2 border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 rounded-lg shadow-lg font-bold text-lg hover:scale-105 transition-transform bg-amber-300 hover:bg-amber-400 text-zinc-950 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:scale-100"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      <div className="text-center mt-8">
        <Link
          href="/"
          className="text-amber-300 hover:text-amber-200 text-sm font-medium hover:underline transition-colors"
        >
          <span aria-hidden="true">←</span> Back to Home
        </Link>
      </div>
    </div>
  );
}
