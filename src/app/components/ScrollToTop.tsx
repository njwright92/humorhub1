"use client";

import type { ComponentProps } from "react";

type ScrollToTopProps = ComponentProps<"button">;

export default function ScrollToTop({
  className = "",
  ...props
}: ScrollToTopProps) {
  return (
    <button
      type="button"
      onClick={() =>
        (document.scrollingElement ?? document.documentElement).scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Scroll back to top"
      className={`grid size-8 place-items-center rounded-full border border-amber-700 text-amber-700 shadow-lg transition-transform hover:scale-110 md:size-12 ${className}`}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 md:size-8"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
