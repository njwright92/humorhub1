export default function Loading() {
  return (
    <div role="status" aria-label="loading" className="flex items-center gap-3">
      <svg
        className="w-8 h-8 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4C17.514 4 22 8.486 22 14C22 19.514 17.514 24 12 24C6.486 24 2 19.514 2 14"
          stroke="#b35a30"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M22 14C22 8.486 17.514 4 12 4"
          stroke="#b35a30"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-amber-300 text-2xl">Loading...</span>
    </div>
  );
}
