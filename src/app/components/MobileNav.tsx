"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./searchBar";
import { useSession } from "./SessionContext";

const MobileMenu = dynamic<{ closeMenu: () => void }>(
  () => import("./MobileMenu"),
);

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export default function MobileNav() {
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [canExpandSearch, setCanExpandSearch] = useState(true);

  const headerRef = useRef<HTMLElement>(null);
  const scrollState = useRef({
    lastY: 0,
    lastDir: "down" as "up" | "down",
    hideStartY: 0,
    ticking: false,
    canExpand: true,
  });

  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const el = headerRef.current;
    if (!el) return;

    let vh = window.innerHeight;
    const s = scrollState.current;

    const update = () => {
      const y = window.scrollY;
      const dir = y < s.lastY ? "up" : "down";
      const shrinkEnd = vh / 4;
      const atTop = y <= 8;

      if (atTop !== s.canExpand) {
        s.canExpand = atTop;
        setCanExpandSearch(atTop);
      }
      if (dir !== s.lastDir) {
        s.lastDir = dir;
        if (dir === "down") s.hideStartY = y;
      }

      const shrink = y <= shrinkEnd ? clamp(y / shrinkEnd) : 1;
      const hide =
        y <= shrinkEnd || dir === "up"
          ? 0
          : clamp((y - Math.max(s.hideStartY, shrinkEnd)) / (vh / 10));

      el.style.setProperty("--shrink", String(shrink));
      el.style.setProperty("--hide", String(hide));

      s.lastY = y;
      s.ticking = false;
    };

    const onScroll = () => {
      if (s.ticking) return;
      s.ticking = true;
      requestAnimationFrame(update);
    };
    const onResize = () => {
      vh = window.innerHeight;
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const close = () => setMenuOpen(false);
  const isSignedIn = session.status === "ready" && session.signedIn;

  return (
    <div className="pb-14 sm:hidden">
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 h-14 [--hide:0] [--shrink:0]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 origin-top bg-amber-700 shadow-lg will-change-transform"
            style={{
              transform:
                "scaleY(calc(1 - 0.2857 * var(--shrink))) translateY(calc(-100% * var(--hide)))",
              opacity: "calc(1 - 0.15 * var(--hide))",
            }}
          />
        </div>

        <div
          className="absolute inset-0 flex items-center justify-between gap-2 p-1 will-change-transform"
          style={{
            transform:
              "translateY(calc(-8px * var(--shrink) - 100% * var(--hide)))",
            opacity: "calc(1 - 0.15 * var(--hide))",
          }}
        >
          <Link href="/" aria-label="Humor Hub Home" onClick={close}>
            <Image
              src="/logo.webp"
              alt=""
              width={60}
              height={60}
              sizes="60px"
              className="shadow-soft size-9 rounded-full will-change-transform"
              style={{
                transform: "scale(calc(1 - 0.3333 * var(--shrink)))",
                transformOrigin: "left center",
              }}
              priority
            />
          </Link>

          <h1
            className="pointer-events-none absolute inset-x-0 mr-2 text-center text-3xl leading-none font-bold tracking-wider text-stone-900 italic will-change-transform"
            style={{ transform: "scale(calc(1 - 0.3333 * var(--shrink)))" }}
          >
            Humor Hub
          </h1>

          <div className="flex items-center gap-2">
            <div
              className="relative flex items-center justify-center text-stone-900 will-change-transform"
              style={{ transform: "scale(calc(0.85 - 0.1 * var(--shrink)))" }}
            >
              <SearchBar
                isUserSignedIn={isSignedIn}
                sessionStatus={session.status}
                onNavigate={close}
                canExpandSearch={canExpandSearch}
              />
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center justify-center p-1 text-stone-900"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="size-8 will-change-transform"
                style={{ transform: "scale(calc(1 - 0.25 * var(--shrink)))" }}
              >
                <path
                  d={
                    menuOpen
                      ? "M6 6l12 12M18 6L6 18"
                      : "M3 12h18M3 6h18M3 18h18"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu closeMenu={close} />}
    </div>
  );
}
