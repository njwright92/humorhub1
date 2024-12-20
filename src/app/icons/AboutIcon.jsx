// src/app/icons/AboutIcon.jsx
import React from "react";

const AboutIcon = () => (
  <svg
    className="h-6 w-6 text-zinc-200 group-hover:text-orange-500 transition-colors"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    {/* Globe */}
    <circle
      cx="12"
      cy="12"
      r="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12h20M12 2c4 0 8 4 8 10s-4 10-8 10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* "i" Symbol */}
    <line
      x1="12"
      y1="9"
      x2="12"
      y2="15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" />
  </svg>
);

export default AboutIcon;
