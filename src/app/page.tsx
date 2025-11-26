"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";
import Header from "./components/header";
import Footer from "./components/footer";
import EventForm from "./components/EventForm";

const HumorHubAPISection = dynamic(() => import("./components/humorHubApi"));

export default function Home() {
  // Lazy-load AOS Animation Library
  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import("aos")).default;
      await import("aos/dist/aos.css");
      AOS.init({ duration: 600, once: true });
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

        <section className="card-style mx-auto w-full">
          <h2 className="title mb-8 text-center sm:mb-10">Mic Finder!</h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg">
                Looking for your next Mic?
                <br />
                <span className="font-bold">MicFinder</span> helps comedians
                find and share Mics worldwide!
                <br />
                <span className="mt-2 block">
                  With 1000s of open mic listings, find your next Mic now!
                </span>
              </p>
              <EventForm />

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
            <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
              <Link href="/MicFinder" className="relative group">
                <Image
                  src={micFinder}
                  alt="Mic Finder Logo"
                  width={180}
                  height={180}
                  className="rounded-full shadow-2xl border-4 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 object-contain"
                  loading="lazy"
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

        <section data-aos="fade-up">
          <HumorHubAPISection />
        </section>
      </div>
      <Footer />
    </>
  );
}
