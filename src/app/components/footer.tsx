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
      <div className="mx-auto w-full max-w-screen-xl p-2 py-4 lg:py-6 ml-2">
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
                width={70}
                height={70}
                className="rounded-full mr-2 cursor-pointer"
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
                    href="https://github.com/njwright92"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    GitHub
                  </a>
                </li>
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
                    href="https://www.linkedin.com/in/nathan-wright-78b237123/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    LinkedIn
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
                <li>
                  <a
                    href="https://www.youtube.com/@justforlaughs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    YouTube
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
              <div className="mb-4">
                <ClientSignOutButton />
              </div>
            )}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="text-zinc-200 sm:mb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-15 w-10 text-zinc-200 rounded full shadow-xl cursor-pointer focus:outline-none m-2 sm:m-0 sm:mr-2 sm:mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19V5m-7 7l7-7 7 7"
                />
              </svg>
            </button>
            <div className="text-center sm:text-left">
              <span className="text-sm sm:text-center block sm:inline">
                © {new Date().getFullYear()} Humor Hub™. All rights reserved.
              </span>
              <p className="italic block sm:inline mt-2 sm:mt-0 sm:ml-4">
                Crafted with passion by Vanilla Nate!{" "}
                <a
                  href="https://njwright92.github.io/paper-kit-portfolio/"
                  className="underline text-blue-500 transition-colors hover:text-zinc-200"
                >
                  Portfolio
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
