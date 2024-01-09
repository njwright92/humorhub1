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
    <footer className="card-style">
      <div className="container mx-auto px-4 py-5 flex flex-col lg:flex-row justify-between items-center lg:items-start text-center lg:text-left">
        <div className="mb-6 lg:mb-0 lg:w-1/3">
          <h1 className="font-bold text-xl mb-2">Contact Us</h1>
          <p className="text-md mb-2">contact@humorhub.club</p>
          <a href="mailto:nitronate@gmail.com" className="btn">
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
            <Link href="https://njwright92.github.io/paper-kit-portfolio/">
              Portfolio{" "}
            </Link>
          </p>
        </div>

        <div className="lg:w-1/3 flex flex-col items-center lg:items-end">
          {isUserSignedIn && (
            <div className="mb-4">
              <ClientSignOutButton />
            </div>
          )}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="self-center lg:self-end"
          >
            <ArrowUpCircleIcon className="h-8 w-8" />
          </button>
        </div>
      </div>
    </footer>
  );
}
