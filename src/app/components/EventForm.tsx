"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically load the heavy form only when needed
const EventFormContent = dynamic(() => import("./EventFormContent"), {
  ssr: false,
  loading: () => (
    <button className="bg-green-600 text-zinc-950 px-2 py-1 rounded-lg shadow-lg font-bold text-lg tracking-wide cursor-wait opacity-80">
      Loading...
    </button>
  ),
});

export default function EventForm() {
  const [isOpen, setIsOpen] = useState(false);

  // Once the user clicks, we render the actual component (which contains the Modal)
  if (isOpen) {
    return <EventFormContent initialOpen={true} />;
  }

  return (
    <button
      className="bg-green-600 hover:bg-green-700 text-zinc-950 px-2 py-1 rounded-lg shadow-lg transform transition-transform hover:scale-105 font-bold text-lg tracking-wide cursor-pointer"
      onClick={() => setIsOpen(true)}
    >
      Add Your Event
    </button>
  );
}
