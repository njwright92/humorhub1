"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import ClientSignOutButton from "./ClientSignOut";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function Footer() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    <footer className="p-6 rounded-lg shadow-lg text-center">
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
        <div className="lg:w-1/3 mb-6 lg:mb-0">
          <h1 className="font-bold text-xl mb-2 text-orange-500">Contact Us</h1>
          <p className="text-md mb-2">contact@humorhub.club</p>
          <a
            href="mailto:nitronate@gmail.com"
            className="btn inline-block py-2 px-4 rounded-xl shadow-lg hover:bg-orange-700 transition-colors"
          >
            Email Me
          </a>
        </div>

        <div className="lg:w-1/3 mb-6 lg:mb-0">
          <h2 className="font-bold text-2xl text-orange-500">
            About Humor Hub
          </h2>
          <p className="text-md mb-2">
            Humor Hub unites the comedic community through technology. From
            discovering the next big comedy event with MicFinder, to honing your
            craft with JokePad, or collaborating through ComicBot, our platform
            is the nexus for all things comedy. Dive into our resources to
            amplify your comedic journey or integrate seamlessly with our
            comprehensive comedy API.
          </p>
          <p className="italic mb-2">
            © {new Date().getFullYear()} Humor Hub - Where Comedy Meets
            Technology.
          </p>
          <p className="italic">
            Crafted with laughter by Nathan Wright. Explore my creative journey
            on my{" "}
            <a
              href="https://njwright92.github.io/paper-kit-portfolio/"
              className="underline text-blue-500 transition-colors hover:text-zinc-200"
            >
              Portfolio.
            </a>
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
            className=" bg-orange-500 text-zinc-900 text-lg px-6  rounded-full shadow-md mt-4 lg:mt-0"
          >
            <ArrowUpCircleIcon className="h-20 w-10" />
          </button>
        </div>
      </div>
    </footer>
  );
}
