"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import AuthModal from "./authModal";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import SearchBar from "./searchBar";
import { useCity } from "./cityContext";
import { useRouter } from "next/navigation";
import micFinder from "../../app/micFinder.webp";
import Image from "next/image";

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const cityContext = useCity();
  const router = useRouter();
  const toggleAuthModal = () => setIsAuthModalOpen(!isAuthModalOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAuthStateChanged = useCallback((user: User | null) => {
    setIsUserSignedIn(!!user);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  const handleSearch = (searchTerm: string) => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    // Check if the normalized search term matches a city in CityContext
    const matchingCity = Object.keys(cityContext).find((city) => {
      const normalizedCity = city.toLowerCase();
      return (
        normalizedCity.startsWith(normalizedSearchTerm) ||
        normalizedCity.includes(normalizedSearchTerm)
      );
    });

    if (matchingCity) {
      // Redirect to the events page with the selected city
      router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
    } else {
      // Handle no matches found
      alert("No matching cities found, adding more cities check back soon.");
    }
  };

  const handleClick = () => {
    if (!isUserSignedIn) {
      alert("Please sign in to access this page");
    }
  };

  return (
    <>
      <header className="p-2 text-zinc-200 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex justify-between items-center ">
          <Link href="/">
            <Image
              src={micFinder}
              alt="Mic"
              width={70}
              height={70}
              className="rounded-full"
              priority
            />
          </Link>

          <SearchBar onSearch={handleSearch} />

          <div className="micFinderTitle">
            <h1 className="text-zinc-900 lg:text-6xl">Humor Hub!</h1>
          </div>

          <div className="flex" id="navbar">
            <button onClick={toggleMenu}>
              <Bars3Icon className="h-8 w-8 text-zinc-900" />
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>

          <div
            className={`absolute top-0 right-0 h-screen w-full bg-zinc-900 bg-opacity-75 z-50 transform ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out flex flex-col gap-2 p-2 items-center text-3xl`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="self-end text-zinc-200"
            >
              <XMarkIcon className="h-8 w-8" />
              <span className="sr-only">Close menu</span>
            </button>
            <Link href="/" className="neu-button">
              <Image
                src={micFinder}
                alt="Mic"
                width={70}
                height={70}
                className="rounded-full"
                priority
              />
            </Link>
            <Link
              href="/MicFinder"
              className="neu-button text-zinc-200 px-2 py-1 rounded-lg shadow-md"
            >
              <span>Mic Finder</span>
            </Link>
            {isUserSignedIn ? (
              <Link href="/ComicBot" className="neu-button" id="comicbot">
                <span>ComicBot</span>
              </Link>
            ) : (
              <span
                className="neu-button opacity-50 cursor-not-allowed"
                onClick={handleClick}
              >
                <span>ComicBot</span>
              </span>
            )}

            {isUserSignedIn ? (
              <Link href="/JokePad" className="neu-button" id="jokepad">
                <span>JokePad</span>
              </Link>
            ) : (
              <span
                className="neu-button opacity-50 cursor-not-allowed"
                onClick={handleClick}
              >
                <span>JokePad</span>
              </span>
            )}

            {isUserSignedIn ? (
              <Link href="/HHapi" className="neu-button" id="news-api">
                <span>News API</span>
              </Link>
            ) : (
              <span
                className="neu-button opacity-50 cursor-not-allowed"
                onClick={handleClick}
              >
                <span>News API</span>
              </span>
            )}

            {isUserSignedIn ? (
              <Link href="/Profile" className="neu-button">
                <span>Profile</span>
              </Link>
            ) : (
              <button onClick={toggleAuthModal} className="neu-button" id="create-account">
                <span>Sign In/Up</span>
              </button>
            )}

            <Link href="/contact" className="neu-button">
              <span>Contact</span>
            </Link>
          </div>
        </nav>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
    </>
  );
}
