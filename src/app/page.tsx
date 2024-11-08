"use client";

import Image from "next/image";
import ComicBot from "../app/Comics.webp";
import jokes from "../app/jokes.webp";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState, useCallback, Suspense } from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import HumorHubAPISection from "./components/humorHubApi";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import Head from "next/head";
import Script from "next/script";

// Dynamic imports
const EventForm = dynamic(() => import("./components/EventForm"));
const ComicBotModal = dynamic(() => import("./components/comicBotModal"));
const AuthModal = dynamic(() => import("./components/authModal"));

export default function Home() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isComicBotModalOpen, setIsComicBotModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle user authentication state changes
  const handleAuthStateChanged = useCallback((user: User | null) => {
    setIsUserSignedIn(!!user);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
    });

    // Initialize Firebase auth state listener
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  function sendDataLayerEvent(
    event_name: string,
    params: { event_category: string; event_label: string },
  ) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: event_name,
      ...params,
    });
  }

  return (
    <>
      <Head>
        <Head>
          <title>Humor Hub - Your Comedy HQ for Open Mics & More</title>
          <meta
            name="description"
            content="Humor Hub: find open mics, perfect jokes with ComicBot, and stay updated on all things comedy. Your go-to resource for comics and comedy fans."
          />
          <meta
            name="keywords"
            content="comedy, humor, open mics, jokes, stand-up, comic resources, funny events"
          />
          <meta property="og:title" content="Humor Hub - Your Comedy HQ" />
          <meta
            property="og:description"
            content="Discover open mics, hone your jokes, and explore comedy events with Humor Hub."
          />
          <meta property="og:url" content="https://www.thehumorhub.com/" />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://www.thehumorhub.com/images/og-image-home.jpg"
          />
        </Head>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@id": "https://www.thehumorhub.com/#website",
                  "@type": "WebSite",
                  name: "Humor Hub",
                  url: "https://www.thehumorhub.com/",
                  potentialAction: {
                    "@type": "SearchAction",
                    target:
                      "https://www.thehumorhub.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                  publisher: {
                    "@id": "https://www.thehumorhub.com/#organization",
                  },
                },
                {
                  "@id": "https://www.thehumorhub.com/#organization",
                  "@type": "Organization",
                  name: "Humor Hub",
                  url: "https://www.thehumorhub.com/",
                  logo: "https://www.thehumorhub.com/hh.webp",
                  sameAs: [
                    "https://www.facebook.com/humorhub",
                    "https://twitter.com/humorhub",
                    "https://www.instagram.com/humorhub",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "njwright92@gmail.com",
                    contactType: "Customer Support",
                  },
                },
              ],
            }),
          }}
        />
      </Head>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-WH6KKVYT8F"
      ></Script>
      <Header />
      <div className="screen-container content-with-sidebar">
        <HumorHubAPISection />
        <section
          data-aos="fade-up"
          className="card-style flex flex-col items-center w-full p-4 xs:p-2 sm:p-4"
        >
          <h2 className="title-style text-2xl sm:text-3xl font-bold mb-4 text-center">
            ComicBot
          </h2>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">
            Unfiltered Comedy, No Writer&#39;s Block
          </h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-center w-full">
            <div
              className="md:w-1/2 flex justify-center mb-4 md:mb-0"
              onClick={() =>
                isUserSignedIn
                  ? setIsComicBotModalOpen(true)
                  : setIsAuthModalOpen(true)
              }
            >
              <Image
                src={ComicBot}
                alt="ComicBot - Unfiltered AI Comedy Assistant"
                width={200}
                height={200}
                className="rounded-xl shadow-lg cursor-pointer"
                loading="lazy"
                style={{ objectFit: "contain", maxWidth: "90%" }}
                sizes="(max-width: 640px) 80vw, (max-width: 768px) 90vw, 250px"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm sm:text-md mb-4">
                Stuck on a joke? ComicBot is your unfiltered, comedy-trained
                chatbot ready to punch through writers block and spark new
                material... &#42;&#42;Coming soon!&#42;&#42;
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isUserSignedIn
                    ? setIsComicBotModalOpen(true)
                    : setIsAuthModalOpen(true);
                }}
                className="btn text-md sm:text-lg py-2 px-4 w-full sm:w-auto hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Try ComicBot Now
              </button>
            </div>
          </div>
        </section>

        <section
          data-aos="fade-up"
          className="card-style bg-zinc-900 text-zinc-200 p-4 xs:p-2 sm:p-4 rounded-xl shadow-md flex flex-col items-center"
        >
          <h2 className="title-style text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
            Jokepad
          </h2>
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">
            Your Personal Comedy Notebook
          </h3>
          <div className="flex flex-col md:flex-row items-center w-full">
            <div
              className="md:w-1/2 flex flex-col items-center justify-center mb-4 md:mb-0"
              onClick={() =>
                isUserSignedIn
                  ? (location.href = "/JokePad")
                  : setIsAuthModalOpen(true)
              }
            >
              <Image
                src={jokes}
                alt="Jokepad - Comedy Notebook"
                width={200}
                height={200}
                className="rounded-xl shadow-lg cursor-pointer"
                loading="lazy"
                style={{ objectFit: "contain", maxWidth: "90%" }}
                sizes="(max-width: 640px) 80vw, (max-width: 768px) 90vw, 250px"
              />
              <button className="btn text-md sm:text-lg py-2 px-4 w-full sm:w-auto hover:bg-green-700 transition-colors mt-4 cursor-pointer">
                Start Using Jokepad
              </button>
            </div>
            <div className="md:w-1/2 flex-1 text-center md:text-left">
              <p className="text-sm sm:text-md mb-4">
                Jokepad helps you brainstorm, save, and tweak your best lines in
                one spot. Keep your creative process smooth and organized.
              </p>
            </div>
          </div>
        </section>

        <section className="card-style bg-zinc-900 text-zinc-200 p-4 xs:p-2 sm:p-4 rounded-xl shadow-md flex flex-col items-center">
          <h2 className="title-style text-2xl sm:text-3xl font-bold mb-4 text-center drop-shadow-md">
            Mic Finder!
          </h2>
          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div className="flex-1 text-center items-center md:text-right">
              <p className="text-sm sm:text-md mb-4">
                Looking for your next performance spot? MicFinder connects you
                with local mics and shows with 1500+ events in 300+ cities,
                updated weekly.
              </p>
              <Suspense fallback={<div>Loading...</div>}>
                <EventForm />
              </Suspense>
            </div>
            <div className="md:w-1/2 flex items-center justify-center mb-4 md:mb-0">
              <Link href="/MicFinder">
                <Image
                  src={micFinder}
                  alt="Mic Finder"
                  width={200}
                  height={200}
                  className="rounded-xl shadow-lg cursor-pointer"
                  loading="lazy"
                  style={{ objectFit: "contain", maxWidth: "90%" }}
                  sizes="(max-width: 640px) 80vw, (max-width: 768px) 90vw, 250px"
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
                  className="btn text-md sm:text-lg items-center py-2 px-4 w-full sm:w-auto mt-6 hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
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

        <ComicBotModal
          isOpen={isComicBotModalOpen}
          onClose={() => setIsComicBotModalOpen(false)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        {/* <Guide /> */}
      </div>
      <Footer />
    </>
  );
}
