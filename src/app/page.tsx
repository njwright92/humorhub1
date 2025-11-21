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

      <div className="screen-container content-with-sidebar">
        <h1 className="hidden md:block text-zinc-200 text-6xl font-bold mb-6 tracking-wide">
          Humor Hub!
        </h1>

        <section className="card-style bg-zinc-800 p-6 rounded-xl shadow-xl max-w-5xl mx-auto">
          {/* Title */}
          <h2 className="title-style mb-8 text-center sm:mb-10">Mic Finder!</h2>

          {/* Layout: Stack (Mobile) -> Row (Desktop) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            {/* LEFT SIDE */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              <p className="text-md md:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg">
                Looking for your next Mic?
                <br />
                <span className="font-bold">MicFinder</span> helps comedians
                find and share open mics worldwide!
                <br />
                <span className="mt-2 block">
                  More than 1600+ Mics/Festivals in over 500 cities!
                </span>
              </p>

              <EventForm />

              {/* CLEANED UP: Applied classes directly to Link, removed wrapper div & span */}
              <Link
                href="/MicFinder"
                className="btn w-80 text-center self-center"
                onClick={() =>
                  sendDataLayerEvent("click_micfinder_button", {
                    event_category: "Navigation",
                    event_label: "MicFinder Button",
                  })
                }
              >
                Find Your Mic!
              </Link>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
              <Link href="/MicFinder" className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-amber-300 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <Image
                  src={micFinder}
                  alt="Mic Finder Logo"
                  width={200}
                  height={200}
                  className="relative rounded-full shadow-2xl border-4 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                  priority
                  style={{ objectFit: "contain" }}
                  onClick={() =>
                    sendDataLayerEvent("click_micfinder_image", {
                      event_category: "Navigation",
                      event_label: "MicFinder Image",
                    })
                  }
                />
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
