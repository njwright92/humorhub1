"use client";

import React, { useCallback, useState } from "react";
import Head from "next/head";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("../components/header"), {});
const Footer = dynamic(() => import("../components/footer"), {});

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
    null,
  );

  // Memoize handleInputChange to avoid re-creating the function on every render
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prevState) => ({ ...prevState, [name]: value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    setSubmitStatus(null); // Reset status before submitting

    try {
      await addDoc(collectionRef, formState);
      setSubmitStatus("success");
      setFormState({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false); // Always stop submitting
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us - Humor Hub</title>
        <meta
          name="description"
          content="Get in touch with Humor Hub for any inquiries, feedback, or support. We're here to help you with anything comedy-related."
        />
        <meta
          name="keywords"
          content="contact, comedy, support, feedback, Humor Hub"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/contact" />
        <meta property="og:title" content="Contact Us - Humor Hub" />
        <meta
          property="og:description"
          content="Get in touch with Humor Hub for any inquiries, feedback, or support. We're here to help you with anything comedy-related."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/contact" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-contact.jpg"
        />
      </Head>
      <Header />
      <div className="screen-container content-with-sidebar mx-auto p-4">
        <section className="bg-zinc-200 shadow-lg rounded-lg p-6 mt-10">
          <h1 className="text-zinc-900 text-3xl font-bold text-center mb-4">
            We&rsquo;d Love to Hear From You
          </h1>
          <p className="text-center mb-6 mt-8 text-zinc-900">
            Your thoughts matter to us! Whether you have a question, feedback,
            or need support, we&rsquo;re all ears. Use the form below to reach
            out, and we promise to get back to you as swiftly as we can.
            We&#39;re here to ensure your experience with Humor Hub is nothing
            short of amazing. Thank you for taking the time to connect with us!
          </p>
          <p className="text-center mb-6 text-zinc-900">
            Do you have questions about our ComicBot, or need help finding the
            perfect open mic event? Maybe you have suggestions on how we can
            improve our platform or just want to share some love. Whatever it
            is, we&rsquo;re here to listen and help. Your feedback is crucial in
            helping us make Humor Hub the best comedy resource on the web.
          </p>
          <p className="text-center mb-6 text-zinc-900">
            Want to know more about how we manage and protect your data? We take
            privacy seriously and are happy to answer any questions you might
            have. Feel free to ask us about our data practices or anything else
            related to your experience on our site.
          </p>
          <p className="text-center mb-6 text-zinc-900">
            If you&rsquo;re a comedian, venue, or event organizer, we&rsquo;re
            especially interested in hearing from you! We are constantly
            updating our database of open mic events, and we would love to add
            your events to our platform. Just send us the details, and
            we&rsquo;ll take care of the rest.
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
                className="mb-2 font-semibold text-zinc-900 mx-auto w-1/2 lg:w-1/4"
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
                className="text-zinc-900 shadow rounded-lg p-2 mx-auto w-1/2 lg:w-1/4"
                aria-label="Name"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="mb-2 font-semibold text-zinc-900 w-1/2 lg:w-1/4 mx-auto"
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
                className="text-zinc-900 shadow rounded-lg p-2 w-1/2 lg:w-1/4 mx-auto"
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
