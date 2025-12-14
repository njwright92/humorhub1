"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically load the heavy form only when needed
const EventFormContent = dynamic(() => import("./EventFormContent"), {
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-sm">
      <div className="animate-pulse rounded-xl bg-stone-800 p-4 font-bold text-zinc-200 shadow-lg">
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
        className="rounded-xl border-2 border-amber-700 bg-transparent px-4 py-2 text-lg font-bold text-zinc-200 shadow-lg hover:scale-105 hover:bg-amber-700 hover:text-white"
      >
        Add Your Event
      </button>
      {isOpen && <EventFormContent onClose={handleClose} />}
    </>
  );
}
