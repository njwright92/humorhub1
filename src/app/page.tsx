"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";

// Static imports for Layout Stability (CLS optimization)
import Header from "./components/header";
import Footer from "./components/footer";

// Dynamic Imports for interactive/heavy components
const HumorHubAPISection = dynamic(() => import("./components/humorHubApi"));
const EventForm = dynamic(() => import("./components/EventForm"), {
  loading: () => (
    <div className="h-24 w-full animate-pulse bg-zinc-800 rounded-xl"></div>
  ),
});

export default function Home() {
  // Lazy-load AOS Animation Library
  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import("aos")).default;
      await import("aos/dist/aos.css");
      AOS.init({ duration: 1000, once: true });
    };
    initAOS();
  }, []);

  // GTM Helper
  const sendDataLayerEvent = useCallback(
    (
      event_name: string,
      params: { event_category: string; event_label: string },
    ) => {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: event_name, ...params });
      }
    },
    [],
  );

  return (
    <>
      <Header />

      <div className="screen-container content-with-sidebar mr-2">
        <h1 className="hidden md:block text-zinc-200 text-4xl font-bold mb-6">
          Humor Hub!
        </h1>

        {/* --- Hero Section --- */}
        <section className="card-style bg-zinc-900 text-zinc-200 p-4 sm:p-4 rounded-xl shadow-md flex flex-col items-center">
          <h2 className="title-style text-2xl sm:text-3xl font-bold mb-4 text-center drop-shadow-md">
            Mic Finder!
          </h2>

          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div className="flex-1 text-center items-center md:text-right">
              <p className="text-sm sm:text-md lg:text-lg mb-4 box-shadow-md text-zinc-300">
                Looking for your next Mic?
                <br />
                MicFinder helps comedians find and share open mics worldwide!
                <br />
                With more than 1600+ Mics/Festivals in over 500 cities!
              </p>
              <EventForm />
            </div>

            <div className="md:w-1/2 flex items-center justify-center gap-4 mb-4 md:mb-0">
              <Link
                href="/MicFinder"
                className="flex items-center justify-center"
              >
                <Image
                  src={micFinder}
                  alt="Mic Finder"
                  width={125}
                  height={125}
                  className="rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                  priority // Load immediately (Above the Fold)
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

        {/* --- News API Section (Handles its own Auth) --- */}
        <section data-aos="fade-up">
          <HumorHubAPISection />
        </section>
      </div>

      <Footer />
    </>
  );
}
