"use client";

import { useState } from "react";
import EventFormContent from "./EventFormContent";

export default function EventForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-outline-amber w-50 text-lg"
      >
        Add Your Event
      </button>
      {isOpen && <EventFormContent onClose={() => setIsOpen(false)} />}
    </>
  );
}
