const ComicBotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-zinc-200 group-hover:text-orange-500 transition-colors"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    {/* Robot Head */}
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      ry="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Antenna */}
    <line
      x1="12"
      y1="2"
      x2="12"
      y2="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Eyes */}
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    {/* Smiling Mouth */}
    <path
      d="M8 14c1.5 2 4.5 2 6 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ComicBotIcon;
