"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import news from "../../app/news.webp";
import type { Auth } from "firebase/auth";
import { useToast } from "./ToastContext"; // ✅ 1. Import Toast

const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

const HumorHubAPISection: React.FC = () => {
  const { showToast } = useToast(); // ✅ 2. Use Hook
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const router = useRouter();
  const authRef = useRef<Auth | null>(null);

  // Dynamic auth import + listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { auth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");

      authRef.current = auth as Auth;

      unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
        setIsUserSignedIn(!!user);
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Auto-Redirect after successful sign-in
  useEffect(() => {
    if (isUserSignedIn && pendingRedirect) {
      router.push("/HHapi");
      setPendingRedirect(false);
      setIsAuthModalOpen(false);
    }
  }, [isUserSignedIn, pendingRedirect, router]);

  // Handler for Guest Users
  const handleAuthClick = useCallback(() => {
    if (authRef.current?.currentUser) {
      router.push("/HHapi");
    } else {
      // ✅ 3. Show Toast Alert Here
      showToast("Please sign in to view News.", "info");
      setPendingRedirect(true);
      setIsAuthModalOpen(true);
    }
  }, [router, showToast]);

  return (
    <section className="card-style mx-auto w-full">
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
                className="rounded-full shadow-2xl border-2 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 object-contain"
                loading="lazy"
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
                className="rounded-full shadow-2xl border-4 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 object-contain"
                loading="lazy"
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
