"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic Import of the Heavy Content
const EventFormContent = dynamic(() => import("./EventFormContent"), {
  ssr: false,
  loading: () => (
    // Loading state matches the real button exactly to prevent layout shift
    <button className="bg-green-600 text-zinc-950 px-2 py-1 rounded-xl shadow-lg font-bold text-lg tracking-wide cursor-wait">
      Loading...
    </button>
  ),
});

export default function EventForm() {
  // 1. Should we load the bundle? (Hover or Click triggers this)
  const [shouldLoad, setShouldLoad] = useState(false);

  // 2. Did the user click? (If yes, tell the modal to open immediately)
  const [wasClicked, setWasClicked] = useState(false);

  const handleMouseEnter = () => {
    // Just prefetch the code, don't auto-open the modal
    setShouldLoad(true);
  };

  const handleClick = () => {
    // Load the code AND open the modal
    setWasClicked(true);
    setShouldLoad(true);
  };

  if (shouldLoad) {
    // Pass "wasClicked" to the heavy component
    return <EventFormContent initialOpen={wasClicked} />;
  }

  return (
    <button
      className="bg-green-600 hover:bg-green-800 text-zinc-950 px-2 py-1 rounded-xl shadow-lg transform transition-transform hover:scale-105 font-bold text-lg tracking-wide"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      Add Event
    </button>
  );
}
