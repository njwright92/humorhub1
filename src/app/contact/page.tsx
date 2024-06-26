"use client";

import React, { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

const collectionRef = collection(db, "contacts");

const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collectionRef, formState);
      setSubmitStatus("success");
      setFormState({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      setSubmitStatus("error");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Header />
      <div className="screen-container mx-auto px-4">
        <section className="bg-zinc-200 shadow-lg rounded-lg p-6 mt-10">
          <h1 className="title text-3xl font-bold text-center mb-4">
            We&rsquo;d Love to Hear From You
          </h1>
          <p className="text-center mb-6 mt-8 text-zinc-900">
            Your thoughts matter to us! Whether you have a question, feedback,
            or need support, we&rsquo;re all ears. Use the form below to reach
            out, and we promise to get back to you as swiftly as we can.
            We&#39;re here to ensure your experience with Humor Hub is nothing
            short of amazing. Thank you for taking the time to connect with us!
          </p>
          {submitStatus === "success" && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
              Thank you for reaching out! Your message has been sent
              successfully. We&lsquo;ll get back to you as soon as possible.
            </div>
          )}
          {submitStatus === "error" && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4">
              Oops! Something went wrong while submitting your form. Please try
              again later.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="mb-2 font-semibold text-zinc-900"
              >
                Your Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                required
                value={formState.name}
                onChange={handleInputChange}
                className="text-zinc-900 shadow rounded-lg p-2"
                aria-label="Name"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="mb-2 font-semibold text-zinc-900"
              >
                Your Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                value={formState.email}
                onChange={handleInputChange}
                className="text-zinc-900 shadow rounded-lg p-2"
                aria-label="Email"
              />
            </div>
            <div className="flex flex-col mb-6">
              <label
                htmlFor="message"
                className="mb-2 font-semibold text-zinc-900"
              >
                Your Message:
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="How can we help you?"
                required
                value={formState.message}
                onChange={handleInputChange}
                className="text-zinc-900 shadow rounded-lg p-2"
                aria-label="Message"
              />
            </div>
            <button
              type="submit"
              className="btn bg-orange-500 hover:bg-orange-600 text-zinc-200 font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
              disabled={isSubmitting}
              aria-label="Send Message"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
