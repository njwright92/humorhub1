"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "./ToastContext";
import hh from "../../app/hh.webp";

// Lazy load icons
const MicFinderIcon = dynamic(() => import("../icons/MicFinderIcon"), {
  ssr: false,
});
const NewsIcon = dynamic(() => import("../icons/NewsIcon"), { ssr: false });
const ContactIcon = dynamic(() => import("../icons/ContactIcon"), {
  ssr: false,
});
const AboutIcon = dynamic(() => import("../icons/AboutIcon"), { ssr: false });
const UserIconComponent = dynamic(() => import("../icons/UserIconComponent"), {
  ssr: false,
});

const SearchBar = dynamic(() => import("./searchBar"), {
  ssr: false,
  loading: () => <div className="h-8 w-8 bg-zinc-700/50 rounded-full" />,
});

const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

interface MinimalAuth {
  currentUser: unknown;
}

// ============ MEMOIZED SUB-COMPONENTS ============

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
  const content = (
    <>
      {icon}
      <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-950 text-amber-300 text-sm px-2 py-1 rounded opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none font-bold whitespace-nowrap z-50 shadow-lg">
        {label}
      </span>
    </>
  );

  const className =
    "group relative transform transition-transform hover:scale-110 hover:text-zinc-700";

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} aria-label={label} className={className}>
      {content}
    </button>
  );
});

const HamburgerIcon = memo(function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
});

const CloseIcon = memo(function CloseIcon() {
  return (
    <svg
      className="fill-current h-9 w-9 text-zinc-200"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
    >
      <title>Close</title>
      <path d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.641 3.641a.5.5 0 11-.707.707L10 10.707l-3.641 3.641a.5.5 0 11-.707-.707L9.293 10 5.652 6.359a.5.5 0 01.707-.707L10 9.293l3.641-3.641a.5.5 0 01.707 0z" />
    </svg>
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

  // ============ AUTH EFFECTS ============

  // Optimistic auth check (instant)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasAuthData = Object.keys(window.localStorage).some((key) =>
        key.startsWith("firebase:authUser:"),
      );
      if (hasAuthData) setIsUserSignedIn(true);
    }
  }, []);

  // Real auth init (background)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const idleCallback =
        window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

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
    [],
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
    [isUserSignedIn, router, showToast],
  );

  // ============ MOBILE: Just the hamburger trigger ============

  if (isMobile) {
    return (
      <>
        <button
          onClick={toggleMenu}
          className="text-zinc-950 cursor-pointer hover:scale-105 transition-transform"
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>

        {/* Mobile Fullscreen Menu */}
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

  // ============ DESKTOP: Full sidebar ============

  if (isDesktop) {
    return (
      <>
        <div className="hidden sm:flex flex-col items-center justify-between h-full p-2 w-15 fixed bg-amber-300/90 left-0 top-0 z-50 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center space-y-6 mt-4 w-full mx-auto text-zinc-900">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Home"
              className="group relative transform transition-transform hover:scale-110 text-zinc-900"
            >
              <Image
                src={hh}
                alt="Humor Hub Logo"
                width={50}
                height={50}
                className="rounded-full cursor-pointer border-2 border-zinc-900 mx-auto shadow-lg"
                priority
              />
              <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-950 text-amber-300 text-sm px-2 py-1 rounded opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none font-bold whitespace-nowrap z-50 shadow-lg">
                Home
              </span>
            </Link>

            {/* Search */}
            <div className="h-8 w-8 transform transition-transform hover:scale-110 mx-auto cursor-pointer relative z-50">
              <SearchBar
                isUserSignedIn={isUserSignedIn}
                setIsAuthModalOpen={setIsAuthModalOpen}
              />
            </div>

            {/* Nav Links */}
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

          {/* Hamburger for full menu */}
          <div className="mt-auto mb-4 flex flex-col items-center gap-3">
            <button
              onClick={toggleMenu}
              className="text-zinc-950 hover:text-zinc-700 transform transition-transform hover:scale-110"
              aria-label="Open full menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>

        {/* Desktop Menu Overlay */}
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
  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-900/95 text-zinc-200 z-50 flex flex-col items-center gap-4 p-4 backdrop-blur-sm animate-slide-in">
      <button
        onClick={closeMenu}
        className="self-end cursor-pointer mb-2 p-2 hover:text-amber-300 transition-colors"
        aria-label="Close menu"
      >
        <CloseIcon />
      </button>

      <Link href="/" aria-label="Home" onClick={closeMenu}>
        <Image
          src={hh}
          alt="Humor Hub Logo"
          width={50}
          height={50}
          className="rounded-full border-2 border-zinc-900 shadow-lg"
          priority
        />
      </Link>

      <SearchBar
        isUserSignedIn={isUserSignedIn}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />

      <div className="flex flex-col gap-4 text-center w-full max-w-xs">
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
      </div>
    </div>
  );
});

// ============ MENU HELPERS ============

const menuItemClass =
  "flex flex-col items-center p-3 cursor-pointer text-2xl no-underline transition-transform duration-300 bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-700 hover:scale-105 w-full text-zinc-200";

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
    <button onClick={onClick} className={menuItemClass}>
      {label}
    </button>
  );
}
