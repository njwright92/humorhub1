"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Optimized client-side routing
import dynamic from "next/dynamic";
import news from "../../app/news.webp";
import { auth } from "../../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";

// Dynamic import for the modal to reduce initial bundle size
const AuthModal = dynamic(() => import("./authModal"));

const HumorHubAPISection: React.FC = () => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Optimized Action Handler
  const handleAction = useCallback(() => {
    if (isUserSignedIn) {
      router.push("/HHapi"); // Instant SPA navigation
    } else {
      setIsAuthModalOpen(true);
    }
  }, [isUserSignedIn, router]);

  return (
    <div className="card-style rounded-lg shadow-lg p-4 sm:p-4">
      <h2 className="title-style text-2xl sm:text-2xl font-bold text-center drop-shadow-md">
        Hub News!
      </h2>
      <h3 className="text-center text-md sm:text-lg mb-4 p-2">
        Your Source for Fresh Headlines!
      </h3>

      <div className="rounded-lg shadow-lg bg-zinc-750 text-zinc-200 flex flex-col sm:flex-row-reverse items-center justify-center p-4">
        {/* Image Container */}
        <div
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={handleAction}
          role="button"
          tabIndex={0}
          aria-label="Go to News Section"
          onKeyDown={(e) => e.key === "Enter" && handleAction()}
        >
          <Image
            src={news}
            alt="Comedy News Update"
            width={125}
            height={125}
            className="rounded-xl shadow-lg"
            loading="lazy"
            style={{ objectFit: "contain", maxWidth: "100%" }}
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 60vw, 150px"
          />
        </div>

        {/* Text & Button Container */}
        <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:mr-4">
          <p className="mb-4 mt-2 sm:mb-2 text-sm sm:text-sm">
            Looking for something topical? Check out the Hub News!
          </p>

          <button
            onClick={handleAction}
            className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors cursor-pointer w-full sm:w-auto"
          >
            Check It Out
          </button>
        </div>
      </div>

      {/* 
         Conditional Rendering: Only render Modal code if it's open.
         This keeps the DOM lighter.
      */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          isOpen={isAuthModalOpen}
        />
      )}
    </div>
  );
};

export default HumorHubAPISection;
