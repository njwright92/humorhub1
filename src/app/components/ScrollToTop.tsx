"use client";

export default function ScrollToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      className="flex size-8 items-center justify-center rounded-full border border-amber-700 text-amber-700 shadow-lg transition-transform hover:scale-110 md:size-12"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-6 md:size-8"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
