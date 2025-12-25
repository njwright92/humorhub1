export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3">
      <svg
        className="size-10 animate-spin text-amber-700"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={4}
          className="opacity-25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-2xl font-bold text-amber-700">Loading...</span>
    </div>
  );
}
