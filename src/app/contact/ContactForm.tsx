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
      <section className="bg-zinc-800/80 border border-zinc-700 shadow-2xl rounded-xl p-8 backdrop-blur-sm">
        {/* STATUS MESSAGES */}
        {submitStatus === "success" && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6 text-center animate-slide-in">
            Message sent successfully! We&#39;ll get back to you soon.
          </div>
        )}
        {submitStatus === "error" && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-center animate-slide-in">
            Something went wrong. Please try again later.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME & EMAIL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col text-left">
              <label
                htmlFor="name"
                className="mb-2 text-xs font-bold text-zinc-300 uppercase tracking-wider font-sans"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name"
                required
                autoComplete="name"
                value={formState.name}
                onChange={handleInputChange}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="flex flex-col text-left">
              <label
                htmlFor="email"
                className="mb-2 text-xs font-bold text-zinc-300 uppercase tracking-wider font-sans"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={formState.email}
                onChange={handleInputChange}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* MESSAGE */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="message"
              className="mb-2 text-xs font-bold text-zinc-300 uppercase tracking-wider font-sans"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="How can we help you?"
              required
              rows={5}
              autoComplete="off"
              value={formState.message}
              onChange={handleInputChange}
              className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none transition-all resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-auto px-8 py-3 rounded-lg shadow-lg font-bold text-lg transform transition-transform hover:scale-105 cursor-pointer ${
              isSubmitting
                ? "bg-zinc-600 text-zinc-400 cursor-not-allowed hover:scale-100"
                : "bg-amber-300 hover:bg-amber-400 text-zinc-950"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      <div className="text-center mt-8">
        <Link
          href="/"
          className="text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
