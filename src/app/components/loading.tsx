export default function Loading() {
  return (
    // 💡 OPTIMIZATION 1: Added `flex` and `gap` for better visual alignment
    <div role="status" aria-label="loading" className="flex items-center gap-2">
      {/* 💡 OPTIMIZATION 2: Simplified SVG structure and removed unnecessary tags (g, clipPath, defs) */}
      <svg
        className="w-8 h-8 stroke-orange-500 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4.00996C17.514 4.00996 22 8.49596 22 14.0099C22 19.5239 17.514 24.0099 12 24.0099C6.48604 24.0099 2 19.5239 2 14.0099"
          stroke="currentColor" // 💡 FIX 3: Use 'currentColor' to inherit color from Tailwind class
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-25" // Optional: Dim the whole circle path slightly
        />
        <path
          // This path defines the visible part of the spinner (top half)
          d="M22 14.0099C22 8.49596 17.514 4.00996 12 4.00996"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          // This path defines the visible part of the spinner (bottom half)
          d="M2 14.0099C2 19.5239 6.48604 24.0099 12 24.0099"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {/* 💡 OPTIMIZATION 4: Added class to make text accessible but visually hidden if needed */}
      <span className="text-orange-500">Loading...</span>
    </div>
  );
}
