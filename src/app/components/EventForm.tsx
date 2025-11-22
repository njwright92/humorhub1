"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// This tells Next.js: "Don't look at EventFormContent (or Firebase) yet!"
const EventFormContent = dynamic(() => import("./EventFormContent"), {
  ssr: false,
  loading: () => (
    <button className="bg-green-700 text-black px-2 py-1 rounded-xl font-bold text-lg opacity-50 cursor-wait">
      Loading...
    </button>
  ),
});

export default function EventForm() {
  // State to track if we should load the heavy stuff
  const [shouldLoad, setShouldLoad] = useState(false);

  return (
    <>
      {shouldLoad ? (
        <EventFormContent />
      ) : (
        <button
          // FACADE: Matches your button style exactly, costs 0KB
          className="bg-green-600 hover:bg-green-700 text-black px-2 py-1 rounded-xl shadow-lg transform transition-transform hover:scale-105 font-bold text-lg tracking-wide"
          // On Click: Load the form
          onClick={() => setShouldLoad(true)}
          // On Hover: Start loading in background (so it's ready when they click)
          onMouseEnter={() => setShouldLoad(true)}
        >
          Add Event
        </button>
      )}
    </>
  );
}
