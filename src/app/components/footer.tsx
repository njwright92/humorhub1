"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import ClientSignOutButton from "./ClientSignOut";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

export default function Footer() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  const handleAuthStateChanged = useCallback((user: User | null) => {
    setIsUserSignedIn(!!user);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="card-style text-center p-6 rounded-lg shadow-lg">
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
        <div className="lg:w-1/3 mb-6 lg:mb-0">
          <h2 className="font-bold text-xl mb-2">Contact Us</h2>
          <p className="text-md mb-2">contact@humorhub.club</p>
          <a
            href="mailto:nitronate@gmail.com"
            className="btn inline-block bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors"
          >
            Email Me
          </a>
        </div>

        <div className="lg:w-1/3 mb-6 lg:mb-0">
          <p className="text-md mb-2">
            Humor Hub: A synergy of comedy and technology. Engage with ComicBot,
            create with JokePad, discover with MicFinder, and integrate with our
            comedy API.
          </p>
          <p className="italic mb-2">© {new Date().getFullYear()} Humor Hub!</p>
          <p className="italic">
            Made by Nathan Wright visit my{" "}
            <a
              href="https://njwright92.github.io/paper-kit-portfolio/"
              className="underline"
            >
              Portfolio
            </a>
          </p>
        </div>

        <div className="lg:w-1/3 flex flex-col items-center lg:items-end">
          {isUserSignedIn && (
            <div className="mb-4">
              {/* Ensure ClientSignOutButton is correctly imported and used here */}
              <ClientSignOutButton />
            </div>
          )}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="btn bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-4 lg:mt-0"
          >
            {/* Ensure ArrowUpCircleIcon is correctly imported and used here */}
            <ArrowUpCircleIcon className="h-8 w-8" />
          </button>
        </div>
      </div>
    </footer>
  );
}
