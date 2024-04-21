"use client";

import React, { useState, useMemo } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { db } from "../../../firebase.config";
import { collection, addDoc } from "firebase/firestore";

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const collectionRef = useMemo(() => collection(db, "contacts"), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collectionRef, formState);
      console.log("Document written with ID: ", docRef.id);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Please try again.");
    }
    setFormState({
      name: "",
      email: "",
      message: "",
    });
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
            or need support, we&rsquo;re all ears. Use the form below to reach out,
            and we promise to get back to you as swiftly as we can. We&#39;re here
            to ensure your experience with Humor Hub is nothing short of
            amazing. Thank you for taking the time to connect with us!
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col mb-4">
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
              />
            </div>
            <div className="flex flex-col mb-4">
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
              />
            </div>
            <button
              type="submit"
              className="btn bg-orange-500 hover:bg-orange-600 text-zinc-200 font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
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
