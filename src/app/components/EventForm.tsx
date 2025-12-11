"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically load the heavy form only when needed
const EventFormContent = dynamic(() => import("./EventFormContent"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-zinc-800 p-4 rounded-lg shadow-xl text-zinc-200 animate-pulse font-bold">
        Loading Form...
      </div>
    </div>
  ),
});

export default function EventForm() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-zinc-950 font-bold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform tracking-wide"
      >
        Add Your Event
      </button>

      {isOpen && <EventFormContent onClose={handleClose} />}
    </>
  );
}
