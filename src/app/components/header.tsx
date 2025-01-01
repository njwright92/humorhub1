"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import hh from "../../app/hh.webp";
import Image from "next/image";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.config";

const MicFinderIcon = dynamic(() => import("../icons/MicFinderIcon"));
const NewsIcon = dynamic(() => import("../icons/NewsIcon"));
const ComicBotIcon = dynamic(() => import("../icons/ComicBotIcon"));
const JokePadIcon = dynamic(() => import("../icons/JokePadIcon"));
const ContactIcon = dynamic(() => import("../icons/ContactIcon"));
const AboutIcon = dynamic(() => import("../icons/AboutIcon"));
const UserIconComponent = dynamic(() => import("../icons/UserIconComponent"));
const SearchBar = dynamic(() => import("./searchBar"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
const ComicBotModal = dynamic(() => import("./comicBotModal"));
export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isComicBotModalOpen, setIsComicBotModalOpen] = useState(false);
  // const [eventCount, setEventCount] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [cityList, setCityList] = useState<string[]>([]);
  // const fetchedOnce = useRef(false);
  const router = useRouter();

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number,
    immediate: boolean = false,
  ) {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const callNow = immediate && !timeout;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          func(...args);
        }
      }, wait);

      if (callNow) {
        func(...args);
      }
    };
  }

  // Toggle modal and menu
  const toggleAuthModal = useCallback(
    () => setIsAuthModalOpen((prev) => !prev),
    [],
  );
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  // Handle Firebase auth state change
  const handleAuthStateChanged = useCallback((user: User | null) => {
    setIsUserSignedIn(!!user);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cities"));
        const fetchedCities: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.city) {
            fetchedCities.push(data.city);
          }
        });
        setCityList(fetchedCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  // Firebase auth listener, clean up on unmount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  // Auto-hide banner after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowBanner(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Handle search functionality
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        const matchingCity = cityList.find((city) =>
          city.toLowerCase().includes(normalizedSearchTerm),
        );

        if (matchingCity) {
          router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
        } else {
          alert(
            "Sorry, we couldn't find any matching cities. We're constantly adding more, so please check back soon!",
          );

          try {
            await addDoc(collection(db, "searchedCities"), {
              city: searchTerm,
              timestamp: new Date(),
            });
          } catch (error) {
            console.error("Error logging searched city:", error);
          }
        }
      }, 300),
    [cityList, router],
  );

  return (
    <>
      <header className="p-1 text-zinc-900 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex md:flex-col justify-between items-center md:fixed md:h-full md:w-20">
          {/* Logo for smaller screens */}
          <Link href="/">
            <Image
              src={hh}
              alt="Mic"
              width={50}
              height={50}
              className="rounded-full cursor-pointer bg-zinc-900 p-2 md:hidden"
              priority
              style={{ objectFit: "contain" }}
              sizes="(max-width: 640px) 40px, (max-width: 768px) 45px, 50px"
              aria-label="Home"
            />
          </Link>

          {/* Sidebar for larger screens */}
          <div className="hidden md:flex flex-col items-center justify-between h-full p-2 w-15 fixed bg-zinc-800 bg-opacity-90 left-0 z-50 shadow-lg">
            {/* Top Section - Logo */}
            <div className="flex flex-col items-center space-y-6 mt-4">
              <Link href="/" aria-label="Home">
                <Image
                  src={hh}
                  alt="Mic"
                  width={50}
                  height={50}
                  className="rounded-full cursor-pointer bg-zinc-900 p-1 mb-2 transform transition-transform hover:scale-105"
                />
              </Link>
            </div>

            {/* Middle Section - Navigation Icons */}
            <div className="flex flex-col items-center justify-center space-y-6 mt-4">
              <SearchBar onSearch={debouncedSearch} />
              {/* Mic Finder */}
              <Link
                href="/MicFinder"
                aria-label="Mic Finder"
                className="relative group transform transition-transform hover:scale-105"
              >
                <MicFinderIcon />
              </Link>

              {/* News */}
              <div
                onClick={() => {
                  if (isUserSignedIn) {
                    location.href = "/HHapi";
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="cursor-pointer relative group transform transition-transform hover:scale-105"
                aria-label="News"
              >
                <NewsIcon />
                <span className="sr-only">News</span>
              </div>

              {/* Comic Bot */}
              <div
                onClick={() => {
                  if (isUserSignedIn) {
                    setIsComicBotModalOpen(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="cursor-pointer relative group transform transition-transform hover:scale-105"
                aria-label="Comic Bot"
              >
                <ComicBotIcon />
                <span className="sr-only">Comic Bot</span>
              </div>

              {/* Joke Pad */}
              <div
                onClick={() => {
                  if (isUserSignedIn) {
                    location.href = "/JokePad";
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="cursor-pointer relative group transform transition-transform hover:scale-105"
                aria-label="Joke Pad"
              >
                <JokePadIcon />
                <span className="sr-only">Joke Pad</span>
              </div>

              {/* Contact Us */}
              <Link
                href="/contact"
                aria-label="Contact Us"
                className="relative group transform transition-transform hover:scale-105"
              >
                <ContactIcon />
              </Link>

              {/* About */}
              <Link
                href="/about"
                aria-label="About"
                className="relative group transform transition-transform hover:scale-105"
              >
                <AboutIcon />
              </Link>

              {/* Profile / Sign In */}
              {isUserSignedIn ? (
                <Link
                  href="/Profile"
                  aria-label="Profile"
                  className="relative group transform transition-transform hover:scale-105"
                >
                  <UserIconComponent />
                </Link>
              ) : (
                <button
                  onClick={toggleAuthModal}
                  className="text-zinc-200 hover:text-orange-500 relative group transform transition-transform hover:scale-105"
                  aria-label="Sign In/Up"
                >
                  <UserIconComponent />
                </button>
              )}
            </div>

            {/* Bottom Section - Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="text-zinc-200 hover:text-orange-500 mt-auto"
              aria-label="Open full menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
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

          <div className="flex justify-between">
            {showBanner && (
              <div
                className="
      absolute top-20 left-0 right-0 flex justify-center text-center
      text-yellow-400 text-md bg-zinc-700 rounded-full p-1 shadow-xl animate-bounce
      md:fixed md:top-5 md:right-5 md:left-auto"
              >
                *1700+ events and growing!*
              </div>
            )}

            <h1 className="text-zinc-900 text-4xl mx-auto font-bold md:hidden">
              Humor Hub!
            </h1>
            <button
              onClick={toggleMenu}
              className="text-zinc-900 md:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-4"
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

          {/* Full menu toggle for smaller screens */}
          {isMenuOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-zinc-900 text-zinc-200 bg-opacity-75 z-50 flex flex-col items-center gap-6 p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="self-end cursor-pointer mb-4"
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
              <SearchBar onSearch={debouncedSearch} />
              <Link href="/">
                <Image
                  src={hh}
                  alt="Mic"
                  width={50}
                  height={50}
                  className="rounded-full mt-2 cursor-pointer"
                  priority
                />
              </Link>
              <div className="nav-link">
                <div
                  onClick={() => {
                    if (isUserSignedIn) {
                      location.href = "/HHapi";
                    } else {
                      setIsAuthModalOpen(true); // Open AuthModal if not signed in
                    }
                  }}
                >
                  <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                    {isUserSignedIn ? "News" : "News"}
                  </span>
                </div>
                <div
                  onClick={() => {
                    if (isUserSignedIn) {
                      setIsComicBotModalOpen(true);
                    } else {
                      setIsAuthModalOpen(true); // Open AuthModal if not signed in
                    }
                  }}
                >
                  <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                    {isUserSignedIn ? "Comic Bot" : "Comic Bot"}
                  </span>
                </div>
                <div
                  onClick={() => {
                    if (isUserSignedIn) {
                      location.href = "/JokePad";
                    } else {
                      setIsAuthModalOpen(true); // Open AuthModal if not signed in
                    }
                  }}
                >
                  <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                    {isUserSignedIn ? "Joke Pad" : "Joke Pad"}
                  </span>
                </div>
                <Link href="/MicFinder">
                  <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                    Mic Finder
                  </span>
                </Link>

                {isUserSignedIn && (
                  <Link href="/Profile">
                    <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                      Profile
                    </span>
                  </Link>
                )}

                <Link href="/contact">
                  <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                    Contact Us
                  </span>
                </Link>
                <Link href="/about">
                  <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                    About
                  </span>
                </Link>
                {!isUserSignedIn && (
                  <button
                    onClick={toggleAuthModal}
                    className=" bg-green-600 rounded-2xl p-1 shadow-lg text-zinc-100 cursor-pointer"
                    style={{
                      margin: "0 auto",
                      display: "block",
                    }}
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
      <ComicBotModal
        isOpen={isComicBotModalOpen}
        onClose={() => setIsComicBotModalOpen(false)}
      />
    </>
  );
}
