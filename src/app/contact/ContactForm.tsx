"use client";

import React, { useCallback, useState } from "react";
import emailjs from "@emailjs/browser";
import Link from "next/link";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("../components/header"), {});
const Footer = dynamic(() => import("../components/footer"), {});

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
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="screen-container content-with-sidebar flex flex-col items-center justify-center">
        <div className="w-full">
          <h1 className="title text-center mb-2 tracking-wide">Contact Us</h1>
          <p className="text-zinc-300 text-center mb-8">
            Questions, feedback, or support? We&#39;re here to help.
          </p>

          <section className="bg-zinc-800/50 border border-zinc-700 shadow-2xl rounded-xl p-8">
            {/* STATUS MESSAGES */}
            {submitStatus === "success" && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6 text-center animate-fade-in">
                Message sent successfully! We&#39;ll get back to you soon.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-center animate-fade-in">
                Something went wrong. Please try again later.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME & EMAIL GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label
                    htmlFor="name"
                    className="mb-2 text-xs font-bold text-zinc-300 uppercase tracking-wider"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    required
                    autoComplete="false"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="mb-2 text-xs font-bold text-zinc-300 uppercase tracking-wider"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="false"
                    value={formState.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* MESSAGE */}
              <div className="flex flex-col">
                <label
                  htmlFor="message"
                  className="mb-2 text-xs font-bold text-zinc-300 uppercase tracking-wider"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  required
                  rows={5}
                  autoComplete="false"
                  value={formState.message}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn
                  ${
                    isSubmitting
                      ? "bg-zinc-600 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-500"
                  }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
