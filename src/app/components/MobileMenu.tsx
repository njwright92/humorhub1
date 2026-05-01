"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./searchBar";
import CloseIcon from "./CloseIcon";
import { useSession } from "./SessionContext";
import { useProtectedNavigation } from "./useProtectedNavigation";

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

  return (
    <div className="animate-slide-in fixed inset-0 z-40 grid content-start justify-items-center gap-4 p-2 backdrop-blur-lg">
      <button
        onClick={closeMenu}
        className="justify-self-end p-1 text-stone-900"
        aria-label="Close menu"
        type="button"
      >
        <CloseIcon />
      </button>

      <Link href="/" onClick={closeMenu} aria-label="Humor Hub Home">
        <Image
          src="/logo.webp"
          alt=""
          width={70}
          height={70}
          className="rounded-full shadow-xl"
          priority
          quality={70}
        />
      </Link>

      <SearchBar
        isUserSignedIn={session.signedIn}
        sessionStatus={session.status}
        onNavigate={closeMenu}
        onRequireAuth={requireAuth}
      />

      <nav className="grid w-full max-w-xs gap-4">
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
      </nav>
    </div>
  );
}
