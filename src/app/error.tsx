"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log non-sensitive error info to server-side monitoring if configured.
    // Intentionally no console.* calls in production code.
  }, [error]);

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="mx-auto max-w-prose text-center">
          <h2 className="text-2xl text-amber-700">Something went wrong</h2>
          <p className="text-stone-400">
            An unexpected error occurred. Try reloading or return home.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button className="btn-primary" onClick={() => reset()}>
              Retry
            </button>
            <Link href="/" className="btn-outline-amber">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
