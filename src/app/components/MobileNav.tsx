"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

interface MobileMenuProps {
  closeMenu: () => void;
}

const MobileMenu = dynamic<MobileMenuProps>(() => import("./MobileMenu"), {
  loading: () => <div className="size-10 rounded-full" />,
});

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8 text-stone-900"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        className="flex items-center justify-center"
        aria-label="Open menu"
      >
        <HamburgerIcon />
      </button>
      {isMenuOpen && <MobileMenu closeMenu={() => setIsMenuOpen(false)} />}
    </>
  );
}
