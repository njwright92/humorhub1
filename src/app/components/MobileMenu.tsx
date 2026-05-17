"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProtectedNavigation } from "./useProtectedNavigation";
import { useSession } from "./SessionContext";

type NavItem = {
  href: string;
  label: string;
  protected?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/mic-finder", label: "Mic Finder" },
  { href: "/News", label: "News", protected: true },
  { href: "/Profile", label: "Profile", protected: true },
  { href: "/contact", label: "Contact Us" },
  { href: "/about", label: "About" },
];

export default function MobileMenu({ closeMenu }: { closeMenu: () => void }) {
  const { session } = useSession();
  const { requireAuth } = useProtectedNavigation({
    onAuthorized: closeMenu,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onEscape);
    };
  }, [closeMenu]);

  const isUserSignedIn =
    session.status === "ready" && session.signedIn === true;

  return (
    <div className="animate-slide-in fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col items-center overflow-y-auto bg-zinc-900/90 pt-6 backdrop-blur-sm">
      <nav className="grid w-full max-w-xs gap-3">
        {NAV_ITEMS.map(({ href, label, protected: isProtected }) =>
          isProtected ? (
            <button
              key={href}
              type="button"
              onClick={() => void requireAuth(href, label)}
              className="menu-item"
            >
              {label}
            </button>
          ) : (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className="menu-item"
            >
              {label}
            </Link>
          ),
        )}

        {!isUserSignedIn && (
          <button
            type="button"
            onClick={() => void requireAuth("/Profile", "Sign In")}
            className="btn-primary mx-auto mt-1 w-1/2"
          >
            Sign In/Sign Up
          </button>
        )}
      </nav>
    </div>
  );
}
