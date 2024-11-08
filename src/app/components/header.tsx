"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import dynamic from "next/dynamic";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import SearchBar from "./searchBar";
import { useCity } from "./cityContext";
import { useRouter } from "next/navigation";
import hh from "../../app/hh.webp";
import Image from "next/image";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase.config";
import ComicBotModal from "./comicBotModal";

const AuthModal = dynamic(() => import("./authModal"));

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isComicBotModalOpen, setIsComicBotModalOpen] = useState(false);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  const fetchedOnce = useRef(false);
  const cityContext = useCity();
  const router = useRouter();

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

  // Fetch event count once
  useEffect(() => {
    if (fetchedOnce.current) return;

    const fetchEventCount = async () => {
      try {
        const response = await fetch("/api/count-events");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setEventCount(data.count);
      } catch (error) {
        console.error("Error fetching event count:", error);
      }
    };

    fetchedOnce.current = true;
    fetchEventCount();
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
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      const matchingCity = Object.keys(cityContext).find((city) =>
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
    },
    [cityContext, router],
  );

  return (
    <>
      <header className="p-1 text-zinc-900 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex justify-between items-center">
          <Link href="/">
            <Image
              src={hh}
              alt="Mic"
              width={50}
              height={50}
              className="rounded-full cursor-pointer bg-zinc-900 p-1"
              loading="eager"
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, 250px"
            />
          </Link>
          {showBanner && eventCount !== null && (
            <div
              className="absolute top-0 transform right-10 mt-2 text-zinc-200 bg-zinc-900 rounded-2xl px-4 py-2 shadow-xl animate-bounce 
          md:text-lg md:px-4 md:py-2 sm:text-md sm:px-2 sm:py-1 xs:text-sm xs:px-2 xs:py12"
            >
              {`Weekly Highlights: ${eventCount} New Mics!`} <br />{" "}
              {`Now adding Comedy Festivals!`}
            </div>
          )}
          <h1 className="text-zinc-900 text-4xl mx-auto">Humor Hub</h1>
          <button
            onClick={toggleMenu}
            className="text-zinc-900 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="h-9 w-9" />
          </button>

          <div
            className={`absolute top-0 left-0 w-full bg-zinc-900 text-zinc-200 bg-opacity-75 z-50 transform ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out flex flex-col gap-2 p-4 items-center text-lg`}
            style={{ maxHeight: "100vh", overflowY: "auto" }}
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="self-end cursor-pointer"
              aria-label="close menu"
            >
              <XMarkIcon className="h-9 w-9 text-zinc-200" />
              <span className="sr-only">Close menu</span>
            </button>
            <SearchBar onSearch={handleSearch} />
            <Link href="/">
              <Image
                src={hh}
                alt="Mic"
                width={70}
                height={70}
                className="rounded-full mt-2 cursor-pointer"
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
                  className=" bg-orange-700 rounded-xl p-2 shadow-lg text-zinc-100 cursor-pointer"
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
