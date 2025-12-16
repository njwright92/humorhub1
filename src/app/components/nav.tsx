"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "./ToastContext";
import hh from "../../app/hh.webp";
import MicFinderIcon from "../icons/MicFinderIcon";
import NewsIcon from "../icons/NewsIcon";
import ContactIcon from "../icons/ContactIcon";
import AboutIcon from "../icons/AboutIcon";
import UserIconComponent from "../icons/UserIconComponent";

const SearchBar = dynamic(() => import("./searchBar"), {
  loading: () => <div className="size-8 animate-pulse rounded-full" />,
});

const AuthModal = dynamic(() => import("./authModal"), {
  loading: () => null,
});

interface MinimalAuth {
  currentUser: unknown;
}

// ============ MEMOIZED SVG ICONS ============

const HamburgerIcon = memo(function HamburgerIcon() {
  return (
    <svg
      className="size-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
});

const CloseIcon = memo(function CloseIcon() {
  return (
    <svg
      className="size-9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
});

// ============ MEMOIZED SUB-COMPONENTS ============

const tooltipClass =
  "pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded  px-2 py-1 text-sm font-bold text-amber-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100";

const NavLink = memo(function NavLink({
  href,
  label,
  icon,
  onClick,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const className =
    "group relative transition-transform hover:scale-110 hover:text-stone-700";

  const content = (
    <>
      {icon}
      <span className={tooltipClass}>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
});

// ============ MAIN NAV COMPONENT ============

interface NavProps {
  isMobile?: boolean;
  isDesktop?: boolean;
}

export default function Nav({ isMobile, isDesktop }: NavProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const authRef = useRef<MinimalAuth | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // Optimistic auth check (instant, safe for hydration)
  useEffect(() => {
    const hasAuthData = Object.keys(localStorage).some((key) =>
      key.startsWith("firebase:authUser:")
    );
    if (hasAuthData) setIsUserSignedIn(true);
  }, []);

  // Real auth init (background)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const idleCallback =
        window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));

      idleCallback(async () => {
        const { getAuth } = await import("../../../firebase.config");
        const { onAuthStateChanged } = await import("firebase/auth");

        const auth = await getAuth();
        authRef.current = auth;

        unsubscribe = onAuthStateChanged(auth, (user) => {
          setIsUserSignedIn(!!user);
        });
      });
    };

    initAuth();
    return () => unsubscribe?.();
  }, []);

  // Handle pending redirect after auth
  useEffect(() => {
    if (isUserSignedIn && pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
      setIsAuthModalOpen(false);
    }
  }, [isUserSignedIn, pendingRedirect, router]);

  // ============ HANDLERS ============

  const toggleAuthModal = useCallback(
    () => setIsAuthModalOpen((prev) => !prev),
    []
  );
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const handleLoginSuccess = useCallback(() => setIsUserSignedIn(true), []);

  const handleProtectedRoute = useCallback(
    (path: string, label: string) => {
      if (isUserSignedIn || authRef.current?.currentUser) {
        router.push(path);
      } else {
        showToast(`Please sign in to view ${label}`, "info");
        setPendingRedirect(path);
        setIsAuthModalOpen(true);
      }
    },
    [isUserSignedIn, router, showToast]
  );

  // ============ MOBILE ============

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={toggleMenu}
          className="text-stone-900 transition-transform hover:scale-105"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
        >
          <HamburgerIcon />
        </button>

        {isMenuOpen && (
          <MobileMenu
            closeMenu={closeMenu}
            isUserSignedIn={isUserSignedIn}
            setIsAuthModalOpen={setIsAuthModalOpen}
            handleProtectedRoute={handleProtectedRoute}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={toggleAuthModal}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </>
    );
  }

  // ============ DESKTOP ============

  if (isDesktop) {
    return (
      <>
        <nav
          aria-label="Main navigation"
          className="fixed inset-y-0 left-0 z-50 hidden w-16 flex-col items-center justify-between bg-amber-700 p-2 shadow-lg backdrop-blur-md sm:flex"
        >
          <div className="mt-4 flex flex-col items-center space-y-6 text-stone-900">
            <Link
              href="/"
              aria-label="Home"
              className="group relative transition-transform hover:scale-110"
            >
              <Image
                src={hh}
                alt=""
                width={50}
                height={50}
                className="rounded-full border-2 border-stone-900 shadow-lg"
                priority
              />
              <span className={tooltipClass}>Home</span>
            </Link>

            <div className="relative z-50 size-8 transition-transform hover:scale-110">
              <SearchBar
                isUserSignedIn={isUserSignedIn}
                setIsAuthModalOpen={setIsAuthModalOpen}
              />
            </div>

            <NavLink
              href="/MicFinder"
              label="Mic Finder"
              icon={<MicFinderIcon />}
            />
            <NavLink
              label="News"
              icon={<NewsIcon />}
              onClick={() => handleProtectedRoute("/HHapi", "News")}
            />
            <NavLink
              label="Profile"
              icon={<UserIconComponent />}
              onClick={() => handleProtectedRoute("/Profile", "Profile")}
            />
            <NavLink
              href="/contact"
              label="Contact Us"
              icon={<ContactIcon />}
            />
            <NavLink href="/about" label="About" icon={<AboutIcon />} />
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className="mb-4 text-stone-900 transition-transform hover:scale-110 hover:text-stone-700"
            aria-label="Open full menu"
            aria-expanded={isMenuOpen}
          >
            <HamburgerIcon />
          </button>
        </nav>

        {isMenuOpen && (
          <MobileMenu
            closeMenu={closeMenu}
            isUserSignedIn={isUserSignedIn}
            setIsAuthModalOpen={setIsAuthModalOpen}
            handleProtectedRoute={handleProtectedRoute}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={toggleAuthModal}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </>
    );
  }

  return null;
}

// ============ MOBILE MENU ============

interface MobileMenuProps {
  closeMenu: () => void;
  isUserSignedIn: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  handleProtectedRoute: (path: string, label: string) => void;
}

const MobileMenu = memo(function MobileMenu({
  closeMenu,
  isUserSignedIn,
  setIsAuthModalOpen,
  handleProtectedRoute,
}: MobileMenuProps) {
  // Trap focus and handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [closeMenu]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="animate-slide-in fixed inset-0 z-50 flex flex-col items-center gap-4 p-4 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={closeMenu}
        className="self-end p-2 transition-colors hover:text-amber-700"
        aria-label="Close menu"
      >
        <CloseIcon />
      </button>

      <Link href="/" aria-label="Home" onClick={closeMenu}>
        <Image
          src={hh}
          alt=""
          width={50}
          height={50}
          className="rounded-full border-2 border-stone-700 shadow-lg"
          priority
        />
      </Link>

      <SearchBar
        isUserSignedIn={isUserSignedIn}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />

      <nav
        aria-label="Mobile navigation"
        className="flex w-full max-w-xs flex-col gap-4"
      >
        <MenuLink href="/MicFinder" label="Mic Finder" onClick={closeMenu} />
        <MenuButton
          label="News"
          onClick={() => {
            closeMenu();
            handleProtectedRoute("/HHapi", "News");
          }}
        />
        <MenuButton
          label="Profile"
          onClick={() => {
            closeMenu();
            handleProtectedRoute("/Profile", "Profile");
          }}
        />
        <MenuLink href="/contact" label="Contact Us" onClick={closeMenu} />
        <MenuLink href="/about" label="About" onClick={closeMenu} />
      </nav>
    </div>
  );
});

// ============ MENU HELPERS ============

const menuItemClass =
  "flex items-center justify-center rounded-2xl p-2 text-2xl shadow-lg transition-transform hover:scale-105 hover:bg-stone-700 bg-stone-800";

function MenuLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} className={menuItemClass} onClick={onClick}>
      {label}
    </Link>
  );
}

function MenuButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={menuItemClass}>
      {label}
    </button>
  );
}
