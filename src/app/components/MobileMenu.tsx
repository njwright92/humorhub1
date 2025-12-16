"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import hh from "../../app/hh.webp";

const SearchBar = dynamic(() => import("./searchBar"), {
  loading: () => <div className="size-10 animate-pulse rounded-full" />,
});

const AuthModal = dynamic(() => import("./authModal"));

const menuItemClass =
  "flex items-center justify-center rounded-2xl bg-stone-800 p-3 text-2xl text-zinc-200 shadow-lg transition-transform hover:scale-105 hover:bg-stone-700";

interface MobileMenuProps {
  closeMenu: () => void;
}

interface MinimalAuth {
  currentUser: unknown;
}

const MobileMenu = memo(function MobileMenu({ closeMenu }: MobileMenuProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const authRef = useRef<MinimalAuth | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (
      Object.keys(localStorage).some((k) => k.startsWith("firebase:authUser:"))
    ) {
      setIsUserSignedIn(true);
    }

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      const auth = await getAuth();
      authRef.current = auth;
      onAuthStateChanged(auth, (user) => setIsUserSignedIn(!!user));
    };

    if ("requestIdleCallback" in window) requestIdleCallback(initAuth);
    else setTimeout(initAuth, 100);
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
      if (isUserSignedIn || authRef.current?.currentUser) {
        closeMenu();
        router.push(path);
      } else {
        showToast(`Please sign in to view ${label}`, "info");
        setPendingRedirect(path);
        setIsAuthModalOpen(true);
      }
    },
    [isUserSignedIn, router, showToast, closeMenu]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu]);

  return (
    <div className="animate-slide-in fixed inset-0 z-50 flex flex-col items-center gap-4 p-4 backdrop-blur-lg">
      <button onClick={closeMenu} className="self-end p-2 text-stone-900">
        <svg
          className="size-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <Link href="/" onClick={closeMenu}>
        <Image
          src={hh}
          alt=""
          width={70}
          height={70}
          className="rounded-full border-2 border-stone-900 shadow-lg"
          priority
        />
      </Link>

      <SearchBar
        isUserSignedIn={isUserSignedIn}
        setIsAuthModalOpen={setIsAuthModalOpen}
        onNavigate={closeMenu}
      />

      <nav className="mt-2 flex w-full max-w-xs flex-col gap-4">
        <Link href="/MicFinder" className={menuItemClass} onClick={closeMenu}>
          Mic Finder
        </Link>
        <button
          onClick={() => handleProtectedRoute("/News", "News")}
          className={menuItemClass}
        >
          News
        </button>
        <button
          onClick={() => handleProtectedRoute("/Profile", "Profile")}
          className={menuItemClass}
        >
          Profile
        </button>
        <Link href="/contact" className={menuItemClass} onClick={closeMenu}>
          Contact Us
        </Link>
        <Link href="/about" className={menuItemClass} onClick={closeMenu}>
          About
        </Link>
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
});

export default MobileMenu;
