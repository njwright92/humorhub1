"use client";

import React, { useState, FormEvent } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here, such as sending data to a server
    console.log(formState);
    alert("Form submitted. Check the console for details.");
  };

  return (
    <><Header />
    <div className="screen-container">
      
      <section className="card-style">
        <h1 className="title">Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <p className="text-center mb-4">
            We're always here to help. If you have any questions, feedback, or
            need assistance, please fill out the form below. Our team will get
            back to you as soon as possible. Thank you for reaching out to us!
          </p>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className="shadow rounded-lg p-2 mb-2"
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              className="shadow rounded-lg p-2 mb-2"
            />
          </div>
          <div>
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              value={formState.message}
              onChange={handleInputChange}
              className="shadow rounded-lg p-2 mb-2"
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </section>
     
    </div>
     <Footer />
     </>
  );
};

export default ContactPage;
