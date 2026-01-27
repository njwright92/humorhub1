"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import SearchBar from "./searchBar";
import { useSession } from "./SessionContext";

const AuthModal = dynamic(() => import("./authModal"));

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

const menuItemClass =
  "grid place-items-center rounded-2xl bg-stone-800 p-3 text-2xl text-zinc-200 shadow-xl transition-transform hover:scale-105 hover:bg-stone-700";

export default function MobileMenu({ closeMenu }: { closeMenu: () => void }) {
  const { showToast } = useToast();
  const router = useRouter();
  const { session, refreshSession, setSignedIn } = useSession();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const handleLoginSuccess = useCallback(() => {
    setSignedIn(true);
    if (pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
      setIsAuthModalOpen(false);
    }
  }, [pendingRedirect, router, setSignedIn]);

  const requireAuth = useCallback(
    async (path: string, label: string) => {
      const current =
        session.status === "ready" ? session : await refreshSession();
      if (current.signedIn) {
        closeMenu();
        router.push(path);
        return;
      }

      showToast(`Please sign in to view ${label}`, "info");
      setPendingRedirect(path);
      setIsAuthModalOpen(true);
    },
    [refreshSession, router, session, showToast, closeMenu],
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
    <div className="animate-slide-in fixed inset-0 z-50 grid content-start justify-items-center gap-4 p-2 backdrop-blur-lg">
      <button
        onClick={closeMenu}
        className="justify-self-end p-1 text-stone-900"
        aria-label="Close menu"
        type="button"
      >
        <svg
          className="size-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
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
        setIsAuthModalOpen={setIsAuthModalOpen}
        onNavigate={closeMenu}
        onRequireAuth={requireAuth}
      />

      <nav className="grid w-full max-w-xs gap-4">
        {NAV_ITEMS.map(({ href, label, protected: isProtected }) =>
          isProtected ? (
            <button
              key={href}
              type="button"
              onClick={() => requireAuth(href, label)}
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
          ),
        )}
      </nav>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
