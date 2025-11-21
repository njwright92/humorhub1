const NewsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-zinc-900 group-hover:text-zinc-700 transition-colors"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    {/* Newspaper */}
    <path
      d="M2 8h20v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Lines representing text */}
    <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
    <line x1="8" y1="16" x2="16" y2="16" strokeLinecap="round" />
    {/* Small rectangle representing an image */}
    <rect
      x="4"
      y="12"
      width="2"
      height="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default NewsIcon;
