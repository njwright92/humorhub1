"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useToast } from "./ToastContext";
import hh from "../../app/hh.webp";
import type { Auth } from "firebase/auth";

// Icons
import MicFinderIcon from "../icons/MicFinderIcon";
import NewsIcon from "../icons/NewsIcon";
import ContactIcon from "../icons/ContactIcon";
import AboutIcon from "../icons/AboutIcon";
import UserIconComponent from "../icons/UserIconComponent";
import SearchBar from "./searchBar";

const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

function debounce<A extends unknown[]>(
  func: (...args: A) => void,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function Header() {
  const { showToast } = useToast();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [cityList, setCityList] = useState<string[]>([]);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const authRef = useRef<Auth | null>(null);
  const debouncedSearchRef = useRef<((term: string) => void) | null>(null);

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
  const handleLoginSuccess = useCallback(() => setIsUserSignedIn(true), []);

  useEffect(() => {
    let mounted = true;
    const fetchCities = async () => {
      try {
        const cached = sessionStorage.getItem("hh_cities");
        if (cached) {
          if (mounted) setCityList(JSON.parse(cached));
          return;
        }
        const snapshot = await getDocs(collection(db, "cities"));
        const fetched = snapshot.docs.map((doc) => String(doc.data()?.city));
        if (mounted) {
          setCityList(fetched);
          sessionStorage.setItem("hh_cities", JSON.stringify(fetched));
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    fetchCities();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const initAuth = async () => {
      const { auth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      authRef.current = auth as Auth;
      unsubscribe = onAuthStateChanged(auth, (user) =>
        setIsUserSignedIn(!!user),
      );
    };
    initAuth();
    return () => unsubscribe?.();
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

  const performSearch = useCallback(
    async (searchTerm: string) => {
      const normalized = searchTerm.toLowerCase().trim();
      const matchingCity = cityList.find((city) =>
        city.toLowerCase().includes(normalized),
      );

      if (matchingCity) {
        router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
      } else {
        try {
          await addDoc(collection(db, "searchedCities"), {
            city: searchTerm,
            timestamp: new Date(),
          });
        } catch {}
      }
    },
    [cityList, router],
  );

  useEffect(() => {
    debouncedSearchRef.current = debounce((term: string) => {
      if (term) performSearch(term);
    }, 300);
  }, [performSearch]);

  const handleOnSearch = useCallback(
    (term: string) => debouncedSearchRef.current?.(term),
    [],
  );

  return (
    <>
      <header className="p-2 text-zinc-900 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex sm:flex-col justify-between items-center sm:fixed md:h-full md:w-20">
          <Link href="/" aria-label="Home">
            <Image
              src={hh}
              alt="HUMOR HUB LOGO"
              width={50}
              height={50}
              className="rounded-full cursor-pointer bg-zinc-900 p-1 sm:hidden object-contain"
              priority
              fetchPriority="high"
            />
          </Link>

          <div className="hidden sm:flex flex-col items-center justify-between h-full p-2 w-15 fixed bg-amber-300/90 left-0 z-50 shadow-lg transition-all">
            <div className="flex flex-col items-center justify-center space-y-8 mt-4 w-full mx-auto text-zinc-900">
              <Link href="/" aria-label="Home" className="sidebar-icon-link ">
                <Image
                  src={hh}
                  alt="Mic"
                  width={60}
                  height={60}
                  className="rounded-full cursor-pointer bg-zinc-900 p-1 mx-auto shadow-lg"
                  priority
                  fetchPriority="high"
                />
                <span className="sidebar-tooltip">Home</span>
              </Link>

              <div className="h-8 w-8 transform transition-transform hover:scale-110 mx-auto cursor-pointer">
                <SearchBar
                  onSearch={handleOnSearch}
                  isUserSignedIn={isUserSignedIn}
                  setIsAuthModalOpen={setIsAuthModalOpen}
                  cities={cityList}
                />
              </div>

              <Link
                href="/MicFinder"
                aria-label="MicFinder"
                className="sidebar-icon-link"
              >
                <MicFinderIcon />
                <span className="sidebar-tooltip">Mic Finder</span>
              </Link>

              <button
                onClick={() => handleProtectedRoute("/HHapi", "News")}
                aria-label="News"
                className="sidebar-icon-link"
              >
                <NewsIcon />
                <span className="sidebar-tooltip">News</span>
              </button>

              <button
                onClick={() => handleProtectedRoute("/Profile", "Profile")}
                aria-label="Profile"
                className="sidebar-icon-link"
              >
                <UserIconComponent />
                <span className="sidebar-tooltip">Profile</span>
              </button>

              <Link
                href="/contact"
                aria-label="Contact Us"
                className="sidebar-icon-link"
              >
                <ContactIcon />
                <span className="sidebar-tooltip">Contact Us</span>
              </Link>

              <Link
                href="/about"
                aria-label="About"
                className="sidebar-icon-link"
              >
                <AboutIcon />
                <span className="sidebar-tooltip">About</span>
              </Link>
            </div>

            <button
              onClick={toggleMenu}
              className="text-zinc-900 hover:text-zinc-700 mt-auto mb-4 transform transition-transform hover:scale-110"
              aria-label="Open full menu"
            >
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
            </button>
          </div>

          <h1 className="text-zinc-950 text-5xl font-extrabold sm:hidden justify-center tracking-wide">
            Humor Hub!
          </h1>

          <button
            onClick={toggleMenu}
            className="text-zinc-950 sm:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
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
          </button>

          {isMenuOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-zinc-900/95 text-zinc-200 z-50 flex flex-col items-center gap-6 p-4 backdrop-blur-sm">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="self-end cursor-pointer mb-4 p-2"
                aria-label="Close menu"
              >
                <svg
                  className="fill-current h-9 w-9 text-zinc-200"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.641 3.641a.5.5 0 11-.707.707L10 10.707l-3.641 3.641a.5.5 0 11-.707-.707L9.293 10 5.652 6.359a.5.5 0 01.707-.707L10 9.293l3.641-3.641a.5.5 0 01.707 0z" />
                </svg>
              </button>

              <SearchBar
                onSearch={handleOnSearch}
                isUserSignedIn={
                  isUserSignedIn || !!authRef.current?.currentUser
                }
                setIsAuthModalOpen={setIsAuthModalOpen}
                cities={cityList}
              />

              <Link href="/">
                <Image
                  src={hh}
                  alt="Mic"
                  width={70}
                  height={70}
                  className="rounded-full mt-2 cursor-pointer"
                  priority
                  fetchPriority="high"
                />
              </Link>

              <div className="flex flex-col gap-4 text-center w-full max-w-xs">
                <Link
                  href="/MicFinder"
                  className="mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mic Finder
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleProtectedRoute("/HHapi", "News");
                  }}
                  className="mobile-menu-item"
                >
                  News
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleProtectedRoute("/Profile", "Profile");
                  }}
                  className="mobile-menu-item"
                >
                  Profile
                </button>
                <Link
                  href="/contact"
                  className="mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  href="/about"
                  className="mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>

                {!isUserSignedIn && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleAuthModal();
                    }}
                    className="bg-green-600 hover:bg-green-700 transition rounded-2xl p-2 px-6 shadow-lg text-zinc-100 cursor-pointer mx-auto block mt-4 font-bold"
                  >
                    Sign In/Up
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={toggleAuthModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
