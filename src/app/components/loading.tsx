export default function Loading() {
  return (
    <div role="status" aria-label="loading" className="flex items-center gap-2">
      <svg
        className="w-8 h-8 stroke-amber-300 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4.00996C17.514 4.00996 22 8.49596 22 14.0099C22 19.5239 17.514 24.0099 12 24.0099C6.48604 24.0099 2 19.5239 2 14.0099"
          stroke="zinc-200"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M22 14.0099C22 8.49596 17.514 4.00996 12 4.00996"
          stroke="zinc-200"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M2 14.0099C2 19.5239 6.48604 24.0099 12 24.0099"
          stroke="zinc-200"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-amber-300 text-2xl">Loading...</span>
    </div>
  );
}
