"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const MobileMenu = dynamic<{ closeMenu: () => void }>(
  () => import("./MobileMenu"),
);

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <div className="pb-16 sm:hidden">
      <header
        className={`fixed top-0 right-0 left-0 z-50 grid grid-cols-[auto_1fr_auto] items-center p-1 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "h-12 bg-amber-700/90 shadow-md backdrop-blur-md"
            : "h-16 bg-amber-700"
        }`}
      >
        <Link href="/" aria-label="Humor Hub Home" onClick={closeMenu}>
          <Image
            src="/logo.webp"
            alt=""
            width={60}
            height={60}
            className={`shadow-soft rounded-full transition-all duration-300 ${
              isScrolled ? "size-9" : "size-11"
            }`}
            quality={70}
            priority
            sizes="(min-width: 768px) 168px, 128px"
          />
        </Link>

        <h1
          className={`text-center tracking-wider text-stone-900 italic transition-all duration-300 ${
            isScrolled ? "text-2xl" : "text-3xl"
          }`}
        >
          Humor Hub
        </h1>

        <button
          type="button"
          onClick={toggleMenu}
          className="grid place-items-center"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-stone-900 transition-all duration-300 ${
              isScrolled ? "size-7" : "size-8"
            }`}
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
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
