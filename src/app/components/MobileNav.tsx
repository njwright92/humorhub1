"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MobileMenu = dynamic<{ closeMenu: () => void }>(
  () => import("./MobileMenu")
);

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        className="grid size-8 place-items-center"
        aria-label="Open menu"
        aria-expanded={isMenuOpen}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 text-stone-900"
          aria-hidden="true"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {isMenuOpen && <MobileMenu closeMenu={() => setIsMenuOpen(false)} />}
    </>
  );
}
