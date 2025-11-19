"use client";

import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";
// 💡 FIX: Import the pre-initialized 'auth' instance from your config file
import { auth } from "../../firebase.config";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
// Removed: Head and Script imports (Metadata/Scripts handled in layout.tsx)

// Dynamic Imports
const Header = dynamic(() => import("./components/header"), { ssr: false });
const Footer = dynamic(() => import("./components/footer"), { ssr: false });
const HumorHubAPISection = dynamic(() => import("./components/humorHubApi"));
const EventForm = dynamic(() => import("./components/EventForm"));
const AuthModal = dynamic(() => import("./components/authModal"));

export default function Home() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const micFinderUrl = micFinder;

  // Handle user authentication state changes
  const handleAuthStateChanged = useCallback(
    (user: User | null) => {
      // Optimization: Check if the state actually needs to change before updating
      if (!!user !== isUserSignedIn) {
        setIsUserSignedIn(!!user);
      }
    },
    [isUserSignedIn],
  );

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true, // Only animate once
    });

    // ✅ FIX: Use the imported 'auth' instance directly
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    // Cleanup function to prevent memory leaks
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  /**
   * Function to push events to the Google Tag Manager (GTM) dataLayer.
   * This is kept local as requested.
   */
  function sendDataLayerEvent(
    event_name: string,
    params: { event_category: string; event_label: string },
  ) {
    // Ensure window.dataLayer exists before pushing
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: event_name,
        ...params,
      });
    }
  }

  return (
    <>
      <Header />

      <div className="screen-container content-with-sidebar mr-2">
        {/* Streamlined h1 styling */}
        <h1 className="hidden md:block text-zinc-200 text-4xl font-bold mb-6">
          Humor Hub!
        </h1>
        <section className="card-style bg-zinc-900 text-zinc-200 p-4 sm:p-4 rounded-xl shadow-md flex flex-col items-center">
          <h2 className="title-style text-2xl sm:text-3xl font-bold mb-4 text-center drop-shadow-md">
            Mic Finder!
          </h2>
          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div className="flex-1 text-center items-center md:text-right">
              <p className="text-sm sm:text-md lg:text-lg mb-4 box-shadow-md">
                Looking for your next Mic?
                <br />
                MicFinder helps comedians find and share open mics worldwide!
                <br />
                With more than 1600+ Mics/Festivals in over 500 cities!
              </p>
              <Suspense fallback={<div>Loading Event Form...</div>}>
                <EventForm />
              </Suspense>
            </div>
            <div className="md:w-1/2 flex items-center justify-center gap-4 mb-4 md:mb-0">
              {/* Image wrapped in its own Link with hover effect */}
              <Link
                href="/MicFinder"
                className="flex items-center justify-center"
              >
                <Image
                  src={micFinderUrl}
                  alt="Mic Finder"
                  width={125}
                  height={125}
                  className="rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                  priority
                  style={{ objectFit: "contain", maxWidth: "100%" }}
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 60vw, 150px"
                  onClick={() =>
                    sendDataLayerEvent("click_micfinder_image", {
                      event_category: "Navigation",
                      event_label: "MicFinder Image",
                    })
                  }
                />
              </Link>
              <Link href="/MicFinder">
                <span
                  className="btn text-md sm:text-lg py-2 px-4 whitespace-nowrap"
                  onClick={() =>
                    sendDataLayerEvent("click_micfinder_button", {
                      event_category: "Navigation",
                      event_label: "MicFinder Button",
                    })
                  }
                >
                  Find Your Mic
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section data-aos="fade-up">
          <HumorHubAPISection />
        </section>

        {/* Commented sections left out for brevity */}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
      <Footer />
    </>
  );
}
