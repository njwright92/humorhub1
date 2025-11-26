"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import news from "../../app/news.webp";
import { auth } from "../../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";

const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

const HumorHubAPISection: React.FC = () => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const router = useRouter();

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-Redirect after successful sign-in
  useEffect(() => {
    if (isUserSignedIn && pendingRedirect) {
      router.push("/HHapi");
      setPendingRedirect(false);
      setIsAuthModalOpen(false);
    }
  }, [isUserSignedIn, pendingRedirect, router]);

  // 3. Handler for Guest Users (Optimistic Check)
  const handleAuthClick = useCallback(() => {
    // If React state is slow but Firebase is ready, go immediately
    if (auth.currentUser) {
      router.push("/HHapi");
    } else {
      setPendingRedirect(true);
      setIsAuthModalOpen(true);
    }
  }, [router]);

  return (
    <section className="card-style mx-auto">
      {/* CHANGED: Used .title class, removed inline styling */}
      <h2 className="title mb-8 text-center sm:mb-10">Hub News!</h2>

      <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 w-full">
        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right space-y-6">
          <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg">
            Your Source for <span className="font-bold">Fresh Headlines!</span>
            <br />
            Looking for something topical?
            <br />
            <span className="mt-2 block">
              Check out the Hub News for the latest updates!
            </span>
          </p>

          {/* Button classes cleaned up */}
          {isUserSignedIn ? (
            <Link
              href="/HHapi"
              className="btn w-80 text-center self-center md:self-end"
            >
              Check It Out
            </Link>
          ) : (
            <button
              onClick={handleAuthClick}
              className="btn w-80 text-center self-center md:self-end"
            >
              Check It Out
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
          {isUserSignedIn ? (
            <Link href="/HHapi" className="relative group cursor-pointer">
              <Image
                src={news}
                alt="Comedy News Update"
                width={180}
                height={180}
                className="relative rounded-full shadow-2xl border-4 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                loading="lazy"
                style={{ objectFit: "contain" }}
              />
            </Link>
          ) : (
            <div
              className="relative group cursor-pointer"
              onClick={handleAuthClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleAuthClick()}
            >
              <Image
                src={news}
                alt="Comedy News Update"
                width={180}
                height={180}
                className="relative rounded-full shadow-2xl border-4 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                loading="lazy"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </div>
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          isOpen={isAuthModalOpen}
        />
      )}
    </section>
  );
};

export default HumorHubAPISection;
