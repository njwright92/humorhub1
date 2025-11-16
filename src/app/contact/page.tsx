"use client";

import React, { useCallback, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import emailjs from "@emailjs/browser";

const Header = dynamic(() => import("../components/header"), {});
const Footer = dynamic(() => import("../components/footer"), {});

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

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
      <Head>
        <title>Contact Us - Humor Hub</title>
        <meta
          name="description"
          content="Contact Humor Hub for inquiries, feedback, or support."
        />
        <meta
          name="keywords"
          content="contact, comedy, support, feedback, Humor Hub"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/contact" />
        <meta property="og:title" content="Contact Us - Humor Hub" />
        <meta
          property="og:description"
          content="Contact Humor Hub for inquiries, feedback, or support."
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
            Contact Us
          </h1>
          <p className="text-center mb-6 text-zinc-900">
            Questions, feedback, or support? Use the form below, and we&apos;ll
            respond promptly.
          </p>
          {submitStatus === "success" && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
              Message sent successfully. We&apos;ll reply soon.
            </div>
          )}
          {submitStatus === "error" && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4">
              Error submitting form. Please try again.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="mb-2 font-semibold text-zinc-900 mx-auto w-1/2 lg:w-1/4"
              >
                Name:
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
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
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
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Your message"
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
              Send
            </button>
          </form>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
