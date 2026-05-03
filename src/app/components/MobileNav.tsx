"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const MobileMenu = dynamic<{ closeMenu: () => void }>(
  () => import("./MobileMenu"),
);

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <div className="sm:hidden">
      <header className="shadow-soft sticky top-0 z-50 grid h-20 grid-cols-[auto_1fr_auto] items-center bg-amber-700 p-2">
        <Link href="/" aria-label="Humor Hub Home" onClick={closeMenu}>
          <Image
            src="/logo.webp"
            alt=""
            width={60}
            height={60}
            className="shadow-soft rounded-full"
            quality={70}
            priority
            sizes="(min-width: 768px) 168px, 128px"
          />
        </Link>

        <h1 className="text-center text-4xl tracking-wider text-stone-900 italic">
          Humor Hub
        </h1>

        <button
          type="button"
          onClick={toggleMenu}
          className="grid size-9 place-items-center"
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
            className="size-9 text-stone-900"
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
