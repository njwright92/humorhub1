"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase.config";
import ClientSignOutButton from "./ClientSignOut";
import hh from "../../app/hh.webp";

export default function Footer() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer
      className="bg-zinc-950 md:ml-20"
      aria-labelledby="footer-heading"
      id="footer"
    >
      <div className="mx-auto w-full max-w-screen-2xl p-4 py-6 lg:py-8">
        <h1
          id="footer-heading"
          className="text-2xl md:text-4xl font-bold text-zinc-200 mb-2 text-center tracking-wide"
        >
          Humor Hub - The Hub of Humor!
        </h1>
        <p className="text-md md:text-xl mb-8 text-center text-zinc-400 max-w-2xl mx-auto">
          Connecting comics and fans with events, tools, and more. Join the fun!
        </p>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <Link
            href="/"
            aria-label="Humor Hub Home"
            className="group flex justify-center md:justify-start md:w-1/4 md:pl-10 mb-6 md:mb-0"
          >
            <Image
              src={hh}
              alt="Humor Hub Logo"
              width={120}
              height={120}
              className="rounded-full shadow-xl transition-transform transform group-hover:scale-110 group-hover:rotate-3 border-4 border-zinc-800 group-hover:border-amber-300 object-contain w-auto h-auto"
              sizes="(max-width: 768px) 60px, 120px"
              loading="lazy"
            />
          </Link>

          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 md:w-3/4 md:pr-10">
            <div>
              <h2 className="mb-4 md:mb-6 text-md md:text-lg font-bold text-amber-300 uppercase tracking-wider">
                Get to Know Us
              </h2>
              <ul className="text-zinc-300 space-y-3 md:space-y-4 font-medium">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white hover:underline transition-colors md:text-lg"
                  >
                    About Humor Hub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white hover:underline transition-colors md:text-lg"
                  >
                    Contact Our Team
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 md:mb-6 text-md md:text-lg font-bold text-amber-300 uppercase tracking-wider">
                Stay Connected
              </h2>
              <ul className="text-zinc-300 space-y-3 md:space-y-4 font-medium">
                <li>
                  <a
                    href="https://twitter.com/naterbug321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors md:text-lg"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/nate_wrigh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors md:text-lg"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/nate_wright3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors md:text-lg"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/njwright92"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors md:text-lg"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 md:mb-6 text-md md:text-lg font-bold text-amber-300 uppercase tracking-wider">
                Legal Info
              </h2>
              <div className="text-zinc-300 flex flex-col space-y-3 md:space-y-4 font-medium">
                <Link
                  href="/userAgreement"
                  className="hover:text-white hover:underline transition-colors md:text-lg"
                >
                  User Agreement
                </Link>
                <Link
                  href="/privacyPolicy"
                  className="hover:text-white hover:underline transition-colors md:text-lg"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row-reverse items-center justify-between w-full gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            {isUserSignedIn && (
              <div className="transform hover:scale-105 transition-transform">
                <ClientSignOutButton />
              </div>
            )}

            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="rounded-full bg-zinc-800 hover:bg-zinc-700 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-amber-300 shadow-lg transition-all hover:scale-110 border border-zinc-700"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 md:w-7 md:h-7"
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

          <span
            className="text-xs md:text-sm text-zinc-400 font-mono text-left"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Humor Hub™. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
