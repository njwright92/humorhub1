"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const MobileMenu = dynamic<{ closeMenu: () => void }>(
  () => import("./MobileMenu"),
);

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollStage, setScrollStage] = useState(0); // 0: full, 1: mid, 2: compact, 3: hidden
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      const t1 = vh / 16; // 1/16th
      const t2 = (vh * 2) / 16; // 2/16th
      const t4 = (vh * 3) / 16; // 3/16th

      const isScrollingUp = y < lastScrollY.current;

      if (y < t1) {
        setScrollStage(0); // Full height
      } else if (y < t2) {
        setScrollStage(1); // Shrunk
      } else if (y < t4) {
        setScrollStage(2); // Compact
      } else {
        // Past 3/16ths threshold
        if (isScrollingUp) {
          setScrollStage(2); // Bring it back compact on scroll up
        } else {
          setScrollStage(3); // Hide on scroll down
        }
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  // Dynamic style arrays
  const headerStyles = [
    "h-16 translate-y-0 opacity-100", // 0: Full
    "h-12 translate-y-0 opacity-100 bg-amber-700/90", // 1: Shrunk
    "h-10 translate-y-0 opacity-100 bg-amber-700/90", // 2: Compact
    "-translate-y-full opacity-0 pointer-events-none", // 3: Hidden
  ][scrollStage];

  const logoStyles = ["size-11", "size-9", "size-8", "size-8"][scrollStage];
  const textStyles = ["text-3xl", "text-2xl", "text-xl", "text-xl"][
    scrollStage
  ];

  return (
    <div className="pb-16 sm:hidden">
      <header
        className={`fixed top-0 right-0 left-0 z-50 grid grid-cols-[auto_1fr_auto] items-center bg-amber-700 p-1 shadow-md transition-all duration-300 ease-in-out ${headerStyles}`}
      >
        <Link href="/" aria-label="Humor Hub Home" onClick={closeMenu}>
          <Image
            src="/logo.webp"
            alt=""
            width={60}
            height={60}
            className={`shadow-soft rounded-full transition-all duration-300 ${logoStyles}`}
            priority
          />
        </Link>

        <h1
          className={`text-center tracking-wider text-stone-900 italic transition-all duration-300 ${textStyles}`}
        >
          Humor Hub
        </h1>

        <button
          type="button"
          onClick={toggleMenu}
          className="grid place-items-center text-stone-900"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className={`transition-all duration-300 ${scrollStage >= 2 ? "size-6" : "size-8"}`}
          >
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </header>

      {isMenuOpen && <MobileMenu closeMenu={closeMenu} />}
    </div>
  );
}
