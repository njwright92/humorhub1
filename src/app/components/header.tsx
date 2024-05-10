"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import AuthModal from "./authModal";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import SearchBar from "./searchBar";
import { useCity } from "./cityContext";
import { useRouter } from "next/navigation";
import hh from "../../app/hh.webp";
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
    const matchingCity = Object.keys(cityContext).find(
      (city) =>
        city.toLowerCase().startsWith(normalizedSearchTerm) ||
        city.toLowerCase().includes(normalizedSearchTerm)
    );

    if (matchingCity) {
      router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
    } else {
      alert("No matching cities found, adding more cities check back soon.");
    }
  };

  return (
    <>
      <header className="p-2 text-zinc-200 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex justify-between items-center">
          <button onClick={toggleMenu} className="text-zinc-900">
            <Bars3Icon className="h-8 w-8" />
          </button>
          <h1 className="text-zinc-900 text-4xl mx-auto">Humor Hub!</h1>
          <Link href="/">
            <Image
              src={hh}
              alt="Mic"
              width={70}
              height={70}
              className="rounded-full"
            />
          </Link>
        </nav>
        <div
          className={`absolute top-0 left-0 h-screen w-full bg-zinc-900 bg-opacity-75 z-50 transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out flex flex-col gap-2 p-4 items-center text-xl`}
        >
          <button onClick={() => setIsMenuOpen(false)} className="self-end">
            <XMarkIcon className="h-9 w-9 text-zinc-200" />
            <span className="sr-only">Close menu</span>
          </button>
          <SearchBar onSearch={handleSearch} />
          <Link href="/" className="text-zinc-200 text-lg">
            Home
          </Link>
          {isUserSignedIn ? (
            <>
              <Link href="/MicFinder">Mic Finder</Link>
              <Link href="/ComicBot">ComicBot</Link>
              <Link href="/JokePad">JokePad</Link>
              <Link href="/HHapi">News</Link>
              <Link href="/Profile">Profile</Link>
            </>
          ) : (
            <button onClick={toggleAuthModal} className="text-lg">
              Sign In/Up
            </button>
          )}
          <Link href="/contact">Contact</Link>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={toggleAuthModal} />
    </>
  );
}
