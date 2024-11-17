// UserIconComponent.jsx
export const UserIconComponent = () => (
  <svg
    className="h-6 w-6 text-zinc-200 group-hover:text-orange-500 transition-colors"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
