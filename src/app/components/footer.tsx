"use client";

import React, { useEffect, useState, useCallback } from "react";
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
      handleAuthStateChanged(user),
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
      style={{ backgroundImage: "linear-gradient(to top #374151, #1f2022)" }}
    >
      <hr className="my-4 border-zinc-200 sm:mx-auto dark:border-zinc-700 lg:my-6" />
      <div className="mx-auto w-full max-w-screen-xl p-2 py-4 lg:py-6">
        <h1 className="text-2xl font-semibold text-zinc-200 mb-2 text-center">
          Humor Hub - The Hub of Humor!
        </h1>
        <p className="text-md mb-4 text-center">
          Connecting comics and fans with events, tools, and more. Join the fun!
        </p>

        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <Image
                src={hh}
                alt="Mic"
                width={60}
                height={60}
                className="rounded-full ml-4 cursor-pointer"
                loading="lazy"
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 250px"
              />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 mr-2">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-orange-500 uppercase">
                Get to Know Us
              </h2>
              <ul className="text-zinc-200">
                <li className="mb-4">
                  <Link
                    href="/about"
                    className="hover:underline cursor-pointer"
                  >
                    About Humor Hub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:underline cursor-pointer"
                  >
                    Contact Our Team
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-orange-500 uppercase">
                Stay Connected
              </h2>
              <ul className="text-zinc-200">
                <li className="mb-4">
                  <a
                    href="https://twitter.com/naterbug321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://www.facebook.com/nate_wrigh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    Facebook
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://www.instagram.com/nate_wright3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    Instagram
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://github.com/njwright92"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-orange-500 uppercase">
                Legal Info
              </h2>
              <div className="text-zinc-200 flex flex-col">
                <Link
                  href="/userAgreement"
                  className="cursor-pointer mb-1 hover:underline"
                >
                  User Agreement
                </Link>
                <Link
                  href="/privacyPolicy"
                  className="cursor-pointer mt-1 hover:underline"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="sm:flex sm:items-center sm:justify-between mt-4">
          <div className="flex flex-col items-center sm:items-start sm:flex-row-reverse sm:justify-between sm:w-full">
            {isUserSignedIn && (
              <div className="mb-4 mr-2">
                <ClientSignOutButton />
              </div>
            )}
            <div className="flex justify-center mb-8 mr-8">
              <button
                onClick={scrollToTop}
                aria-label="Back to top"
                className="cursor-pointer absolute z-10 rounded-full bg-clip-padding border text-token-text-secondary border-token-border-light bg-zinc-900 w-8 h-8 flex items-center justify-center text-zinc-200 shadow-xl focus:outline-none hover:bg-zinc-800"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-zinc-200 items-center justify-center"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-sm sm:text-center block sm:inline">
                © {new Date().getFullYear()} Humor Hub™. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
