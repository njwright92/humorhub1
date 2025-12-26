"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import hh from "../../app/hh1.webp";

const SearchBar = dynamic(() => import("./searchBar"), {
  loading: () => <div className="size-10 animate-pulse rounded-full" />,
});

const AuthModal = dynamic(() => import("./authModal"));

type NavItem = {
  href: string;
  label: string;
  protected?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/MicFinder", label: "Mic Finder" },
  { href: "/News", label: "News", protected: true },
  { href: "/Profile", label: "Profile", protected: true },
  { href: "/contact", label: "Contact Us" },
  { href: "/about", label: "About" },
];

const menuItemClass =
  "grid place-items-center rounded-2xl bg-stone-800 p-3 text-2xl text-zinc-200 shadow-lg transition-transform hover:scale-105 hover:bg-stone-700";

export default function MobileMenu({ closeMenu }: { closeMenu: () => void }) {
  const { showToast } = useToast();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      const auth = await getAuth();
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (mounted) setIsUserSignedIn(!!user);
      });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(initAuth);
    } else {
      setTimeout(initAuth, 100);
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (isUserSignedIn && pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
      setIsAuthModalOpen(false);
    }
  }, [isUserSignedIn, pendingRedirect, router]);

  const handleProtectedRoute = useCallback(
    (path: string, label: string) => {
      if (isUserSignedIn) {
        closeMenu();
        router.push(path);
        return;
      }
      showToast(`Please sign in to view ${label}`, "info");
      setPendingRedirect(path);
      setIsAuthModalOpen(true);
    },
    [isUserSignedIn, router, showToast, closeMenu]
  );

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
    <div className="animate-slide-in fixed inset-0 z-50 flex flex-col items-center gap-4 p-4 backdrop-blur-lg">
      <button
        onClick={closeMenu}
        className="self-end p-2 text-stone-900"
        aria-label="Close menu"
        type="button"
      >
        <svg
          className="size-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <Link href="/" onClick={closeMenu} aria-label="Humor Hub Home">
        <Image
          src={hh}
          alt=""
          width={70}
          height={70}
          className="rounded-full border border-zinc-200 shadow-lg"
          priority
        />
      </Link>

      <SearchBar
        isUserSignedIn={isUserSignedIn}
        setIsAuthModalOpen={setIsAuthModalOpen}
        onNavigate={closeMenu}
      />

      <nav className="mt-2 flex w-full max-w-xs flex-col gap-4">
        {NAV_ITEMS.map(({ href, label, protected: isProtected }) =>
          isProtected ? (
            <button
              key={href}
              type="button"
              onClick={() => handleProtectedRoute(href, label)}
              className={menuItemClass}
            >
              {label}
            </button>
          ) : (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className={menuItemClass}
            >
              {label}
            </Link>
          )
        )}
      </nav>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => setIsUserSignedIn(true)}
        />
      )}
    </div>
  );
}
