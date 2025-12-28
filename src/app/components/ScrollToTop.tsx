"use client";

export default function ScrollToTop({
  className = "",
}: {
  className?: string;
}) {
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
      className={`grid size-9 place-items-center rounded-full border border-amber-700 text-amber-700 shadow-lg transition-transform hover:scale-110 md:size-12 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7 md:size-8"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
