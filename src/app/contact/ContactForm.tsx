"use client";

import { useState, useRef, type SubmitEvent } from "react";
import { useToast } from "../components/ToastContext";

export default function ContactForm() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (isSubmitting || !formRef.current) return;

    const data = new FormData(formRef.current);
    const payload = Object.fromEntries(data.entries());

    if (!payload.name || !payload.email || !payload.message) {
      showToast("Please fill out all fields.", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      showToast("Message sent!", "success");
      formRef.current.reset();
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="animate-slide-in card-dark mx-auto w-full max-w-4xl border-amber-700/50">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-6 text-left"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid">
            <label htmlFor="name" className="form-label mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              required
              className="field-dark"
            />
          </div>
          <div className="grid">
            <label htmlFor="email" className="form-label mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
              className="field-dark"
            />
          </div>
        </div>

        <div className="grid">
          <label htmlFor="message" className="form-label mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Message"
            required
            rows={5}
            className="field-dark resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mx-auto w-64 disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>
      </form>
    </section>
  );
}
