export default function Loading() {
  return (
    <output role="status" className="flex items-center gap-3">
      <svg
        className="size-8 animate-spin text-amber-300"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-2xl font-bold text-amber-300">Loading...</span>
    </output>
  );
}
