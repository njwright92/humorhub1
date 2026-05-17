"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./searchBar";
import { useSession } from "./SessionContext";

const MobileMenu = dynamic<{ closeMenu: () => void }>(
  () => import("./MobileMenu"),
);

// Pre-compute style arrays to avoid re-creation on every render
const HEADER_STYLES = [
  "h-14 bg-amber-700",
  "h-12 bg-amber-700/90",
  "h-10 bg-amber-700/90",
  "-translate-y-full opacity-0 pointer-events-none",
];

const LOGO_STYLES = ["size-9", "size-7", "size-6", "size-6"];
const TEXT_STYLES = ["text-3xl", "text-2xl", "text-xl", "text-xl"];
const SEARCH_SCALE_STYLES = ["scale-85", "scale-75", "scale-75", "scale-70"];

export default function MobileNav() {
  const { session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollStage, setScrollStage] = useState(0);
  const lastScrollY = useRef(0);
  const ticking = useRef(false); // Throttling lock flag

  useEffect(() => {
    const handleScroll = () => {
      // 1. PERFORMANCE: RequestAnimationFrame Throttling
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const vh = window.innerHeight;
          const isScrollingUp = y < lastScrollY.current;

          // Combined calculations to drop variable clutter
          if (y < vh / 16) setScrollStage(0);
          else if (y < (vh * 2) / 16) setScrollStage(1);
          else if (y < (vh * 4) / 16) setScrollStage(2);
          else setScrollStage(isScrollingUp ? 2 : 3);

          lastScrollY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const headerStyles = HEADER_STYLES[scrollStage];
  const logoStyles = LOGO_STYLES[scrollStage];
  const textStyles = TEXT_STYLES[scrollStage];
  const searchScaleStyles = SEARCH_SCALE_STYLES[scrollStage];

  const isUserSignedIn = session.status === "ready" && session.signedIn;

  return (
    <div className="pb-14 sm:hidden">
      <header
        className={`fixed top-0 right-0 left-0 z-40 flex items-center justify-between gap-2 p-1 shadow-lg transition-all duration-300 ease-in-out ${headerStyles}`}
      >
        <div className="flex items-center">
          <Link href="/" aria-label="Humor Hub Home" onClick={closeMenu}>
            <Image
              src="/logo.webp"
              alt=""
              width={60}
              height={60}
              sizes="(min-width: 768px) 168px, 128px"
              className={`shadow-soft rounded-full transition-all duration-300 ${logoStyles}`}
              priority
            />
          </Link>
        </div>

        <h1
          className={`pointer-events-none absolute inset-x-0 mr-2 text-center font-bold tracking-wider text-stone-900 italic transition-all duration-300 ${textStyles}`}
        >
          Humor Hub
        </h1>

        {/* Right Aligned: Action Controls Panel (Search & Hamburger) */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center text-stone-900 transition-all duration-200 ${searchScaleStyles}`}
          >
            <SearchBar
              isUserSignedIn={isUserSignedIn}
              sessionStatus={session.status}
              onNavigate={closeMenu}
            />
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center justify-center p-1 text-stone-900"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className={`transition-all duration-300 ${scrollStage >= 2 ? "size-6" : "size-8"}`}
            >
              <path
                d={
                  isMenuOpen
                    ? "M6 6l12 12M18 6L6 18"
                    : "M3 12h18M3 6h18M3 18h18"
                }
                transition-all="true"
                duration-300="true"
              />
            </svg>
          </button>
        </div>
      </header>
      {isMenuOpen && <MobileMenu closeMenu={closeMenu} />}
    </div>
  );
}
