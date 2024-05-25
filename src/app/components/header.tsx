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
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../../../firebase.config";

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

  const handleSearch = async (searchTerm: string) => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    // First, check for an exact match
    let matchingCity = Object.keys(cityContext).find(
      (city) => city.toLowerCase() === normalizedSearchTerm
    );

    // If no exact match is found, check for partial matches
    if (!matchingCity) {
      matchingCity = Object.keys(cityContext).find(
        (city) =>
          city.toLowerCase().startsWith(normalizedSearchTerm) ||
          city.toLowerCase().includes(normalizedSearchTerm)
      );
    }

    if (matchingCity) {
      router.push(`/MicFinder?city=${encodeURIComponent(matchingCity)}`);
    } else {
      alert("No matching cities found, adding more cities check back soon.");

      try {
        await addDoc(collection(db, "searchedCities"), {
          city: searchTerm,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error logging searched city: ", error);
      }
    }
  };

  return (
    <>
      <header className="p-1 text-zinc-200 sticky top-0 z-50 bg-gradient-animation">
        <nav className="flex justify-between items-center">
          <Link href="/">
            <Image
              src={hh}
              alt="Mic"
              width={70}
              height={70}
              className="rounded-full cursor-pointer"
              loading="eager"
            />
          </Link>

          <h1 className="text-zinc-900 text-4xl mx-auto">Humor Hub!</h1>
          <button onClick={toggleMenu} className="text-zinc-900 cursor-pointer">
            <Bars3Icon className="h-9 w-9" />
          </button>

          <div
            className={`absolute top-0 left-0 w-full bg-zinc-900 bg-opacity-75 z-50 transform ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out flex flex-col gap-2 p-4 items-center text-lg`}
            style={{ maxHeight: "100vh", overflowY: "auto" }}
          >
            <button onClick={() => setIsMenuOpen(false)} className="self-end cursor-pointer">
              <XMarkIcon className="h-9 w-9 text-zinc-200" />
              <span className="sr-only ">Close menu</span>
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
                onClick={() =>
                  isUserSignedIn
                    ? (location.href = "/HHapi")
                    : alert("Please sign in to access this page")
                }
              >
                <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                  {isUserSignedIn ? "News" : "News"}
                </span>
              </div>
              <div
                onClick={() =>
                  isUserSignedIn
                    ? (location.href = "/ComicBot")
                    : alert("Please sign in to access this page")
                }
              >
                <span className="nav-link bg-zinc-900 rounded-xl p-2 shadow-lg cursor-pointer">
                  {isUserSignedIn ? "Comic Bot" : "Comic Bot"}
                </span>
              </div>
              <div
                onClick={() =>
                  isUserSignedIn
                    ? (location.href = "/JokePad")
                    : alert("Please sign in to access this page")
                }
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
                  Contact
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
    </>
  );
}
