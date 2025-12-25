"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const EventFormContent = dynamic(() => import("./EventFormContent"));

export default function EventForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-2xl border-2 border-amber-700 bg-transparent px-3 py-2 text-lg font-bold shadow-lg transition-transform hover:scale-105 hover:bg-amber-700 hover:text-white"
      >
        Add Your Event
      </button>
      {isOpen && <EventFormContent onClose={() => setIsOpen(false)} />}
    </>
  );
}
