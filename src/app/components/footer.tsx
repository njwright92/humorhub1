"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import ClientSignOutButton from "./ClientSignOut";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import hh from "../../app/hh.webp";

export default function Footer() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  const handleAuthStateChanged = useCallback((user: User | null) => {
    setIsUserSignedIn(!!user);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      handleAuthStateChanged(user)
    );
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <footer
      style={{ backgroundImage: "linear-gradient(to top, #1f2022, #374151)" }}
    >
      <hr className="my-6 border-zinc-200 sm:mx-auto dark:border-zinc-700 lg:my-8" />
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <h1 className="text-2xl font-semibold text-zinc-200 mb-2 text-center">
          Humor Hub
        </h1>
        <p className="text-md mb-4 text-center">
          Humor Hub unites the comedic community through technology.
        </p>

        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <Image
                src={hh}
                alt="Mic"
                width={70}
                height={70}
                className="rounded-full mr-2 cursor-pointer"
              />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 mr-2">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-orange-500 uppercase">
                Resources
              </h2>
              <ul className="text-zinc-200">
                <li className="mb-4">
                  <Link
                    href="/about"
                    className="hover:underline cursor-pointer"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:underline cursor-pointer"
                  >
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-orange-500 uppercase">
                Follow us
              </h2>
              <ul className="text-zinc-200">
                <li className="mb-4">
                  <a
                    href="https://github.com/njwright92"
                    className="hover:underline cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Github
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://twitter.com/naterbug321"
                    className="hover:underline cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    X
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://www.linkedin.com/in/nathan-wright-78b237123/"
                    className="hover:underline cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://www.facebook.com/nate_wrigh"
                    className="hover:underline cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://www.instagram.com/nate_wright3"
                    className="hover:underline cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@justforlaughs"
                    className="hover:underline cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    YouTube/Stand Up
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-orange-500 uppercase">
                Legal
              </h2>
              <div className="text-zinc-200 flex flex-col">
                <Link className="cursor-pointer mb-1" href="/userAgreement">
                  User Agreement
                </Link>
                <Link className="cursor-pointer mt-1" href="/privacyPolicy">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="sm:flex sm:items-center sm:justify-between mt-4">
          <div className="flex flex-col items-center sm:items-start sm:flex-row-reverse sm:justify-between sm:w-full">
            {isUserSignedIn && (
              <div className="mb-4 sm:mb-0 sm:ml-4">
                <ClientSignOutButton />
              </div>
            )}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="bg-orange-500 text-zinc-900 text-lg px-2 rounded-full shadow-md m-2 sm:m-0 sm:ml-4"
            >
              <ArrowUpCircleIcon className="h-20 w-10" />
            </button>
            <div className="text-center sm:text-left">
              <span className="text-sm sm:text-center block sm:inline">
                © {new Date().getFullYear()} Humor Hub™. All Rights Reserved.
              </span>
              <p className="italic block sm:inline mt-2 sm:mt-0 sm:ml-4">
                Crafted with laughter by Nathan Wright.
                <a
                  href="https://njwright92.github.io/paper-kit-portfolio/"
                  className="underline text-blue-500 transition-colors hover:text-zinc-200"
                >
                  Portfolio.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
