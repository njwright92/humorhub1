"use client";

import React, { useState, FormEvent } from "react";
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const collectionRef = collection(db, "contacts");
    try {
      const docRef = await addDoc(collectionRef, {
        ...formState,
      });
      console.log("Document written with ID: ", docRef.id);
      alert("Form submitted successfully!");
      setFormState({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="screen-container mx-auto px-4">
        <section className="bg-gray-300 shadow-lg rounded-lg p-6 mt-10">
          <h1 className="title">Contact Us</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-center mb-6 mt-8 text-black">
              We&apos;re always here to help. If you have any questions,
              feedback, or need assistance, please fill out the form below. Our
              team will get back to you as soon as possible. Thank you for
              reaching out to us!
            </p>
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-2 font-semibold text-black">
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
                className="text-black shadow rounded-lg p-2"
              />

              <label htmlFor="email" className="mb-2 text-black font-semibold">
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
                className="text-black shadow rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="message"
                className="mb-2 font-semibold text-black"
              >
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Describe your issue or question"
                required
                value={formState.message}
                onChange={handleInputChange}
                className="text-black shadow rounded-lg p-2 h-32"
              />
            </div>
            <button id="submit" type="submit" className="btn">
              Submit
            </button>
          </form>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
