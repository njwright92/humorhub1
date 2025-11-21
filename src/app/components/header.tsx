"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase.config";
import hh from "../../app/hh.webp";
import MicFinderIcon from "../icons/MicFinderIcon";
import NewsIcon from "../icons/NewsIcon";
import ContactIcon from "../icons/ContactIcon";
import AboutIcon from "../icons/AboutIcon";
import UserIconComponent from "../icons/UserIconComponent";

const SearchBar = dynamic(() => import("./searchBar"), {
  ssr: false,
  loading: () => null,
});

const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

/* Stable debounce helper */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);

    if (callNow) func(...args);
  };
}

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [cityList, setCityList] = useState<string[]>([]);
  const router = useRouter();
  // 1. Add this state to remember where to go
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // 2. Add this effect to redirect automatically after sign in
  useEffect(() => {
    if (isUserSignedIn && pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
      setIsAuthModalOpen(false);
    }
  }, [isUserSignedIn, pendingRedirect, router]);

  const debouncedSearchRef = useRef<((term: string) => void) | null>(null);

  const toggleAuthModal = useCallback(
    () => setIsAuthModalOpen((prev) => !prev),
    [],
  );
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  /* Fetch list of cities once on mount */
  useEffect(() => {
    let mounted = true;
    const fetchCities = async () => {
      try {
        // Check if we have cached cities in sessionStorage to save a read (Optional advanced optimization)
        const cached = sessionStorage.getItem("hh_cities");
        if (cached) {
          setCityList(JSON.parse(cached));
          return;
        }

        const snapshot = await getDocs(collection(db, "cities"));
        const fetched: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.city) fetched.push(String(data.city));
        });

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

  /* Auth listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsub();
  }, []);

  /* UPDATED: Sets pending redirect for News */
  const handleNewsClick = useCallback(() => {
    if (isUserSignedIn) {
      router.push("/HHapi");
    } else {
      setPendingRedirect("/HHapi"); // Remember we want to go to News
      setIsAuthModalOpen(true);
    }
  }, [isUserSignedIn, router]);

  /* NEW: Sets pending redirect for Profile */
  const handleProfileClick = useCallback(() => {
    if (isUserSignedIn) {
      router.push("/Profile");
    } else {
      setPendingRedirect("/Profile"); // Remember we want to go to Profile
      setIsAuthModalOpen(true);
    }
  }, [isUserSignedIn, router]);

  /* Search Logic */
  const performSearch = useCallback(
    async (searchTerm: string) => {
      const normalized = searchTerm.toLowerCase().trim();
      // Find exact or partial match
      const matchingCity = cityList.find((city) =>
        city.toLowerCase().includes(normalized),
      );

      if (matchingCity) {
        router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
      } else {
        // Log failed/new search terms for analytics
        try {
          await addDoc(collection(db, "searchedCities"), {
            city: searchTerm,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error("Error logging search:", error);
        }
      }
    },
    [cityList, router],
  );

  /* Initialize Debounce */
  useEffect(() => {
    debouncedSearchRef.current = debounce((term: string) => {
      if (!term || typeof term !== "string") return;
      performSearch(term);
    }, 300);
  }, [performSearch]);

  const handleOnSearch = useCallback((term: string) => {
    if (debouncedSearchRef.current) debouncedSearchRef.current(term);
  }, []);

  return (
    <>
      <header className="p-1 text-zinc-900 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex sm:flex-col justify-between items-center sm:fixed md:h-full md:w-20">
          {/* --- Logo (Mobile) --- */}
          <Link href="/">
            <Image
              src={hh}
              alt="HUMOR HUB LOGO"
              width={50}
              height={50}
              className="rounded-full cursor-pointer bg-zinc-900 p-1 sm:hidden"
              priority // High priority for LCP
              style={{ objectFit: "contain" }}
              sizes="(max-width: 640px) 40px, 50px"
            />
          </Link>

          {/* --- Sidebar (Desktop) --- */}
          <div className="hidden sm:flex flex-col items-center justify-between h-full p-2 w-15 fixed bg-amber-300 bg-opacity-90 left-0 z-50 shadow-lg transition-all">
            {/* Top Logo */}
            <div className="flex flex-col items-center space-y-6 mt-4">
              <Link href="/" aria-label="Home" className="relative group">
                <Image
                  src={hh}
                  alt="Mic"
                  width={60}
                  height={60}
                  className="rounded-full cursor-pointer bg-zinc-900 p-1 mb-2 transform transition-transform hover:scale-110 shadow-md"
                  priority
                />
                {/* Home Tooltip */}
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold z-50 shadow-lg">
                  Home
                </span>
              </Link>
            </div>

            {/* Nav Icons */}
            <div className="flex flex-col items-center justify-center space-y-8 mt-4 w-full text-zinc-900 ">
              <div className="h-8 w-8 transform transition-transform hover:scale-110">
                <SearchBar
                  onSearch={handleOnSearch}
                  isUserSignedIn={isUserSignedIn}
                  setIsAuthModalOpen={setIsAuthModalOpen}
                />
              </div>

              {/* 1. Mic Finder */}
              <Link
                href="/MicFinder"
                aria-label="Mic Finder"
                className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
              >
                <MicFinderIcon />
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold whitespace-nowrap z-50 shadow-lg">
                  Mic Finder
                </span>
              </Link>

              {/* 2. News (Conditional: Link if signed in, Button if not) */}
              {isUserSignedIn ? (
                <Link
                  href="/HHapi"
                  aria-label="News"
                  className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
                >
                  <NewsIcon />
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold z-50 shadow-lg">
                    News
                  </span>
                </Link>
              ) : (
                <button
                  onClick={handleNewsClick}
                  aria-label="News (Sign In Required)"
                  className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
                >
                  <NewsIcon />
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold z-50 shadow-lg">
                    News
                  </span>
                </button>
              )}

              {/* 3. Profile (Conditional Link vs Button) */}
              {isUserSignedIn ? (
                <Link
                  href="/Profile"
                  aria-label="Profile"
                  className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
                >
                  <UserIconComponent />
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold z-50 shadow-lg">
                    Profile
                  </span>
                </Link>
              ) : (
                <button
                  /* UPDATED: Use handleProfileClick instead of toggleAuthModal */
                  onClick={handleProfileClick}
                  className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
                  aria-label="Sign In"
                >
                  <UserIconComponent />
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold whitespace-nowrap z-50 shadow-lg">
                    Profile
                  </span>
                </button>
              )}

              {/* 4. Contact Us */}
              <Link
                href="/contact"
                aria-label="Contact Us"
                className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
              >
                <ContactIcon />
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold whitespace-nowrap z-50 shadow-lg">
                  Contact Us
                </span>
              </Link>

              {/* 5. About */}
              <Link
                href="/about"
                aria-label="About"
                className="relative group transform transition-transform hover:scale-110 hover:text-zinc-700"
              >
                <AboutIcon />
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold z-50 shadow-lg">
                  About
                </span>
              </Link>
            </div>

            {/* Menu Toggle (Desktop Sidebar Bottom) */}
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

          {/* --- Mobile Header Title --- */}
          <h1 className="text-zinc-900 text-4xl mr-8 font-bold sm:hidden justify-center">
            Humor Hub!
          </h1>

          {/* --- Mobile Menu Toggle --- */}
          <button
            onClick={toggleMenu}
            className="text-zinc-900 sm:hidden cursor-pointer"
            aria-label="Toggle menu"
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

          {/* --- Full Screen Mobile Menu --- */}
          {isMenuOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-zinc-900 text-zinc-200 bg-opacity-95 z-50 flex flex-col items-center gap-6 p-4 backdrop-blur-sm">
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
                isUserSignedIn={false}
                setIsAuthModalOpen={setIsAuthModalOpen}
              />

              <Link href="/">
                <Image
                  src={hh}
                  alt="Mic"
                  width={70}
                  height={70}
                  className="rounded-full mt-2 cursor-pointer"
                  priority
                />
              </Link>

              <div className="flex flex-col gap-4 text-center w-full max-w-xs">
                <Link
                  href="/MicFinder"
                  className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition"
                >
                  Mic Finder
                </Link>

                {/* NEWS: Link if Signed In, Button if Signed Out */}
                {isUserSignedIn ? (
                  <Link
                    href="/HHapi"
                    onClick={() => setIsMenuOpen(false)}
                    className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition w-full"
                  >
                    News
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleNewsClick(); /* Sets pending redirect to /HHapi */
                    }}
                    className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition w-full"
                  >
                    News
                  </button>
                )}

                {/* PROFILE: Link if Signed In, Button if Signed Out */}
                {isUserSignedIn ? (
                  <Link
                    href="/Profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition w-full"
                  >
                    Profile
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleProfileClick(); /* Sets pending redirect to /Profile */
                    }}
                    className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition w-full"
                  >
                    Profile
                  </button>
                )}
                <Link
                  href="/contact"
                  className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition"
                >
                  Contact Us
                </Link>

                <Link
                  href="/about"
                  className="nav-link bg-zinc-800 rounded-xl p-3 shadow-lg cursor-pointer hover:bg-zinc-700 transition"
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

      <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
    </>
  );
}
