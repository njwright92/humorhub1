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

    // THE UPGRADE: Check if browser supports idle callback
    if ("requestIdleCallback" in window) {
      // Wait until browser is idle, but force run after 2 seconds if it never idles
      (window as any).requestIdleCallback(() => fetchCities(), {
        timeout: 2000,
      });
    } else {
      // Fallback for Safari/Older browsers
      setTimeout(() => fetchCities(), 1000);
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let unsub: any;

    const timer = setTimeout(() => {
      unsub = onAuthStateChanged(auth, (user) => {
        setIsUserSignedIn(!!user);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, []);

  const handleNewsClick = useCallback(() => {
    if (isUserSignedIn || auth.currentUser) {
      router.push("/HHapi");
    } else {
      setPendingRedirect("/HHapi");
      setIsAuthModalOpen(true);
    }
  }, [isUserSignedIn, router]);

  const handleProfileClick = useCallback(() => {
    if (isUserSignedIn || auth.currentUser) {
      router.push("/Profile");
    } else {
      setPendingRedirect("/Profile");
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
      <header className="p-2 text-zinc-900 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex sm:flex-col justify-between items-center sm:fixed md:h-full md:w-20">
          {/* --- Logo (Mobile) --- */}
          <Link href="/">
            <Image
              src={hh}
              alt="HUMOR HUB LOGO"
              width={50}
              height={50}
              className="rounded-full cursor-pointer bg-zinc-900 p-1 sm:hidden object-contain"
              priority
              sizes="(max-width: 640px) 40px, 50px"
            />
          </Link>

          {/* --- Sidebar (Desktop) --- */}
          <div className="hidden sm:flex flex-col items-center justify-between h-full p-2 w-15 fixed bg-amber-300/90 left-0 z-50 shadow-lg transition-all">
            {/* Top Logo - Updated to use sidebar-icon-link for consistent tooltip behavior */}
            <div className="flex flex-col items-center space-y-6 mt-4">
              <Link
                href="/"
                aria-label="Home"
                className="sidebar-icon-link mb-2"
              >
                <Image
                  src={hh}
                  alt="Mic"
                  width={60}
                  height={60}
                  className="rounded-full cursor-pointer bg-zinc-900 p-1 shadow-md"
                  loading="lazy"
                />
                <span className="sidebar-tooltip">Home</span>
              </Link>
            </div>

            {/* Nav Icons */}
            <div className="flex flex-col items-center justify-center space-y-8 mt-4 w-full text-zinc-900">
              <div className="h-8 w-8 transform transition-transform hover:scale-110">
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

              {isUserSignedIn ? (
                <Link
                  href="/HHapi"
                  aria-label="News"
                  className="sidebar-icon-link"
                >
                  <NewsIcon />
                  <span className="sidebar-tooltip">News</span>
                </Link>
              ) : (
                <button
                  onClick={handleNewsClick}
                  aria-label="News (Sign In Required)"
                  className="sidebar-icon-link"
                >
                  <NewsIcon />
                  <span className="sidebar-tooltip">News</span>
                </button>
              )}

              {isUserSignedIn ? (
                <Link
                  href="/Profile"
                  aria-label="Profile"
                  className="sidebar-icon-link"
                >
                  <UserIconComponent />
                  <span className="sidebar-tooltip">Profile</span>
                </Link>
              ) : (
                <button
                  onClick={handleProfileClick}
                  aria-label="Sign In"
                  className="sidebar-icon-link"
                >
                  <UserIconComponent />
                  <span className="sidebar-tooltip">Profile</span>
                </button>
              )}

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

            {/* Menu Toggle (Desktop) */}
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
          <h1 className=" text-zinc-950 text-5xl mr-4 font-extrabold sm:hidden justify-center tracking-wide">
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
                isUserSignedIn={false}
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
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-col gap-4 text-center w-full max-w-xs">
                <Link href="/MicFinder" className="mobile-menu-item">
                  Mic Finder
                </Link>

                {isUserSignedIn ? (
                  <Link
                    href="/HHapi"
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-menu-item"
                  >
                    News
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleNewsClick();
                    }}
                    className="mobile-menu-item"
                  >
                    News
                  </button>
                )}

                {isUserSignedIn ? (
                  <Link
                    href="/Profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-menu-item"
                  >
                    Profile
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleProfileClick();
                    }}
                    className="mobile-menu-item"
                  >
                    Profile
                  </button>
                )}

                <Link href="/contact" className="mobile-menu-item">
                  Contact Us
                </Link>
                <Link href="/about" className="mobile-menu-item">
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
