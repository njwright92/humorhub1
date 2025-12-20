"use client";

import { useState, useCallback } from "react";
import EventFormContent from "./EventFormContent";

export default function EventForm() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-2xl border-2 border-amber-700 bg-transparent px-4 py-2 text-lg font-bold shadow-lg hover:scale-105 hover:bg-amber-700 hover:text-white"
      >
        Add Your Event
      </button>
      {isOpen && <EventFormContent onClose={handleClose} />}
    </>
  );
}
