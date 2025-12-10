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

// Define a minimal interface for what we actually use
interface MinimalAuth {
  currentUser: unknown;
}

// Memoized nav link
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

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className="group relative transform transition-transform hover:scale-110 hover:text-zinc-700"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="group relative transform transition-transform hover:scale-110 hover:text-zinc-700"
    >
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

export default function Header() {
  const { showToast } = useToast();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [cityList, setCityList] = useState<string[]>([]);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // We use 'any' here to avoid importing complex Firebase types on main thread
  const authRef = useRef<MinimalAuth | null>(null);
  // 1. OPTIMISTIC AUTH CHECK: Runs instantly on mount
  // Checks LocalStorage for Firebase keys to set UI state BEFORE downloading SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasAuthData = Object.keys(window.localStorage).some((key) =>
        key.startsWith("firebase:authUser:"),
      );
      if (hasAuthData) setIsUserSignedIn(true);
    }
  }, []);

  // 2. REAL AUTH INIT: Runs in background (off main thread)
  // This downloads the iframe.js but the UI is already painted
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      // requestIdleCallback ensures we don't block interaction
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

  const toggleAuthModal = useCallback(
    () => setIsAuthModalOpen((prev) => !prev),
    [],
  );
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const handleLoginSuccess = useCallback(() => setIsUserSignedIn(true), []);

  // Fetch Cities: De-prioritized
  useEffect(() => {
    let mounted = true;
    const fetchCities = async () => {
      try {
        const cached = sessionStorage.getItem("hh_cities");
        if (cached) {
          if (mounted) setCityList(JSON.parse(cached));
          return;
        }

        // Use API route instead of heavy client Firestore SDK
        const response = await fetch("/api/cities");
        if (response.ok) {
          const data = await response.json();
          if (mounted && data.cities) {
            setCityList(data.cities);
            sessionStorage.setItem("hh_cities", JSON.stringify(data.cities));
          }
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    // Run after main paint
    const timer = setTimeout(fetchCities, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

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

  const handleOnSearch = useCallback(
    (term: string) => {
      if (!term.trim()) return;
      const normalized = term.toLowerCase().trim();
      const matchingCity = cityList.find((city) =>
        city.toLowerCase().includes(normalized),
      );

      if (matchingCity) {
        router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
      }
    },
    [cityList, router],
  );

  return (
    <>
      <header className="p-2 text-zinc-900 sticky top-0 z-50 bg-amber-300">
        <nav className="flex sm:flex-col justify-between items-center sm:fixed md:h-full md:w-20">
          {/* Mobile: Logo */}
          <Link href="/" aria-label="Home" className="sm:hidden">
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

          {/* Desktop Sidebar */}
          <div className="hidden sm:flex flex-col items-center justify-between h-full p-2 w-15 fixed bg-amber-300/90 left-0 z-50 shadow-lg transition-all backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center space-y-6 mt-4 w-full mx-auto text-zinc-900">
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

              <div className="h-8 w-8 transform transition-transform hover:scale-110 mx-auto cursor-pointer relative z-50">
                <SearchBar
                  onSearch={handleOnSearch}
                  isUserSignedIn={isUserSignedIn}
                  setIsAuthModalOpen={setIsAuthModalOpen}
                  cities={cityList}
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

          {/* Mobile: Title */}
          <h1 className="text-zinc-950 font-heading text-5xl font-extrabold sm:hidden justify-center tracking-wide">
            Humor Hub!
          </h1>

          <button
            onClick={toggleMenu}
            className="text-zinc-950 sm:hidden cursor-pointer hover:scale-105 transition-transform"
            aria-label="Toggle menu"
          >
            <HamburgerIcon />
          </button>

          {isMenuOpen && (
            <div className="fixed inset-0 w-full h-full bg-zinc-900/95 text-zinc-200 z-50 flex flex-col items-center gap-4 p-4 backdrop-blur-sm animate-slide-in">
              <button
                onClick={closeMenu}
                className="self-end cursor-pointer mb-2 p-2 hover:text-amber-300 transition-colors"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>

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

              <SearchBar
                onSearch={handleOnSearch}
                isUserSignedIn={isUserSignedIn}
                setIsAuthModalOpen={setIsAuthModalOpen}
                cities={cityList}
              />

              <div className="flex flex-col gap-4 text-center w-full max-w-xs">
                <Link
                  href="/MicFinder"
                  className="flex flex-col items-center p-3 cursor-pointer text-2xl no-underline transition-transform duration-300 bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-700 hover:scale-105 w-full text-zinc-200"
                  onClick={closeMenu}
                >
                  Mic Finder
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    handleProtectedRoute("/HHapi", "News");
                  }}
                  className="flex flex-col items-center p-3 cursor-pointer text-2xl no-underline transition-transform duration-300 bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-700 hover:scale-105 w-full text-zinc-200"
                >
                  News
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    handleProtectedRoute("/Profile", "Profile");
                  }}
                  className="flex flex-col items-center p-3 cursor-pointer text-2xl no-underline transition-transform duration-300 bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-700 hover:scale-105 w-full text-zinc-200"
                >
                  Profile
                </button>
                <Link
                  href="/contact"
                  className="flex flex-col items-center p-3 cursor-pointer text-2xl no-underline transition-transform duration-300 bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-700 hover:scale-105 w-full text-zinc-200"
                  onClick={closeMenu}
                >
                  Contact Us
                </Link>
                <Link
                  href="/about"
                  className="flex flex-col items-center p-3 cursor-pointer text-2xl no-underline transition-transform duration-300 bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-700 hover:scale-105 w-full text-zinc-200"
                  onClick={closeMenu}
                >
                  About
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Only render AuthModal when needed */}
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
