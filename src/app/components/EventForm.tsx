"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const EventFormContent = dynamic(() => import("./EventFormContent"), {
  ssr: false,
  loading: () => (
    <button className="bg-green-600 text-zinc-950 px-2 py-1 rounded-xl shadow-lg font-bold text-lg tracking-wide cursor-wait">
      Loading...
    </button>
  ),
});

export default function EventForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return <EventFormContent initialOpen={true} />;
  }

  return (
    <button
      className="bg-green-600 hover:bg-green-800 text-zinc-950 px-2 py-1 rounded-lg shadow-lg transform transition-transform hover:scale-105 font-bold text-lg tracking-wide"
      onClick={() => setIsOpen(true)}
    >
      Add Your Event
    </button>
  );
}
