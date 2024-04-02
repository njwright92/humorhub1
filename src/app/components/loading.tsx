export default function Loading() {
  return (
    <div role="status" aria-label="loading">
      <svg
        className="w-8 h-8 stroke-orange-500 animate-spin "
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_9023_61563)">
          <path
            d="M14.6437 2.05426C11.9803 1.2966 9.01686 1.64245 6.50315 3.25548C1.85499 6.23817 0.504864 12.4242 3.48756 17.0724C6.47025 21.7205 12.6563 23.0706 17.3044 20.088C20.4971 18.0393 22.1338 14.4793 21.8792 10.9444"
            stroke="stroke-current"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="my-path"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_9023_61563">
            <rect width="32" height="32" fill="zinc-900"></rect>
          </clipPath>
        </defs>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
