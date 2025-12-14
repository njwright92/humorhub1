"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically load the heavy form only when needed
const EventFormContent = dynamic(() => import("./EventFormContent"), {
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-pulse rounded-lg bg-zinc-800 p-4 font-bold text-zinc-200 shadow-xl">
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
        className="rounded-lg bg-green-600 px-2 py-1 text-lg font-bold text-zinc-950 shadow-lg transition-transform hover:scale-105 hover:bg-green-700"
      >
        Add Your Event
      </button>

      {isOpen && <EventFormContent onClose={handleClose} />}
    </>
  );
}
