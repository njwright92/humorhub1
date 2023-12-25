"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import ClientOnlySignOutButton from "./ClientSignOut";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

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
      <div className="container mx-auto flex flex-col lg:flex-row justify-between relative">
        <div>
          <h1 className="font-bold text-xl mb-2 mt-4 lg:mt-0">Contact Us</h1>
          <p className=" text-md mb-2">💌 contact@openmicfinder.com</p>
          <a href="mailto:nitronate@gmail.com" className="btn">
            Email Me
          </a>
        </div>
        <div className="text-center">
          <h1 className="font-bold text-xl mb-2 mt-4 lg:mt-0">
            Check Out Comedify!
          </h1>
          <p className="text-md font-bold mb-2">
            An app to interact with comicBot and write/store your jokes
          </p>
          <a href="https://comedify-54274.web.app/" className="btn">
            Visit Comedify 😃
          </a>
          <p className="italic mb-2 mt-8">
            © {new Date().getFullYear()} OpenMicFinder
          </p>
        </div>
        {isUserSignedIn && (
          <div className="mt-4 lg:mt-0">
            <ClientOnlySignOutButton />
          </div>
        )}
        <button onClick={scrollToTop} aria-label="Back to top">
          <ArrowUpCircleIcon className="h-8 w-8" />
        </button>
      </div>
    </footer>
  );
}
