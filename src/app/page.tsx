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
    params: { event_category: string; event_label: string }
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
        <title>
          &quot;Humor Hub - The Hub of Humor, Open Mics, and ComicBot&quot;
        </title>
        <meta
          name="description"
          content="Discover the ultimate hub for everything comedy, featuring open mic events, AI-driven ComicBot, and comedy tools. Explore jokes, puns, and more at Humor Hub."
        />
        <meta
          name="keywords"
          content="comedy, humor, funny, jokes, puns, open mic, comedy events"
        />
        <meta
          property="og:title"
          content="Humor Hub - The Hub of Humor, Open Mics, and ComicBot"
        />
        <meta
          property="og:description"
          content="Discover the ultimate hub for everything comedy, featuring open mic events, AI-driven ComicBot, and comedy tools. Explore jokes, puns, and more at Humor Hub."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-home.jpg"
        />
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
      <div className="screen-container">
        <HumorHubAPISection />
        <section
          data-aos="fade-up"
          className="card-style flex flex-col items-center w-full p-4"
        >
          <h2 className="title-style text-3xl font-bold mb-4 text-center">
            Meet ComicBot
          </h2>
          <h3 className="text-xl font-semibold mb-6">
            Your Comedy Genius Assistant!
          </h3>
          <div className="md:flex-row flex flex-col md:items-center md:justify-center w-full">
            <div
              className="md:w-1/2 flex justify-center mb-4 md:mb-0"
              onClick={() => {
                sendDataLayerEvent("click_comicbot_image", {
                  event_category: "Engagement",
                  event_label: "ComicBot Image",
                });
                if (isUserSignedIn) {
                  setIsComicBotModalOpen(true);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
            >
              <Image
                src={ComicBot}
                alt="ComicBot - Your Comedy Genius Assistant"
                width={250}
                height={250}
                className="rounded-xl shadow-lg cursor-pointer"
                loading="lazy"
                style={{ objectFit: "contain", maxWidth: "100%" }}
                sizes="(max-width: 768px) 90vw, 250px"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Meet ComicBot: your AI comedy companion. Get instant jokes,
                puns, and stage-ready material. Perfect for both new and
                seasoned comedians.
              </p>
              <br />
              <p className="mb-4">
                Designed for comedians and humor lovers, ComicBot helps you
                generate, refine, and organize your comedy. Whether you&lsquo;re
                on the go or need fresh ideas, ComicBot delivers.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sendDataLayerEvent("click_comicbot_button", {
                    event_category: "Engagement",
                    event_label: "ComicBot Button",
                  });
                  if (!isUserSignedIn) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsComicBotModalOpen(true);
                  }
                }}
                className="btn inline-block text-lg py-2 px-4 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Unlock Your Creative Side with ComicBot
              </button>
            </div>
          </div>
        </section>

        <section
          data-aos="fade-up"
          className="card-style bg-zinc-900 text-zinc-200 p-4 rounded-xl shadow-md flex flex-col items-center"
        >
          <h2 className="title-style text-3xl font-bold mb-6 text-center">
            Jokepad
          </h2>
          <h3 className="text-xl font-bold mb-6 text-center">
            Your Ultimate Comedy Workshop
          </h3>
          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div
              className="md:w-1/2 flex flex-col items-center justify-center mb-4 md:mb-0"
              onClick={() => {
                sendDataLayerEvent("click_jokepad_image", {
                  event_category: "Engagement",
                  event_label: "Jokepad Image",
                });
                if (isUserSignedIn) {
                  location.href = "/JokePad";
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
            >
              <Image
                src={jokes}
                alt="Jokepad - Your Ultimate Comedy Workshop"
                width={250}
                height={250}
                className="rounded-xl shadow-lg cursor-pointer"
                loading="lazy"
                style={{ objectFit: "contain", maxWidth: "100%" }} // Ensure image doesn't exceed screen width
                sizes="(max-width: 768px) 90vw, 250px" // Make the image 90% width on mobile
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sendDataLayerEvent("click_jokepad_button", {
                    event_category: "Engagement",
                    event_label: "Jokepad Button",
                  });
                  if (!isUserSignedIn) {
                    setIsAuthModalOpen(true);
                  } else {
                    location.href = "/JokePad";
                  }
                }}
                className="btn inline-block text-lg py-2 px-4 hover:bg-green-700 transition-colors mt-4 cursor-pointer"
              >
                Explore Jokepad Now
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Jokepad turns your ideas into a cloud-synced joke library.
                Refine punchlines or brainstorm new humor, ready whenever
                inspiration hits.
              </p>
              <p className="mb-4">
                With an easy interface and secure cloud-sync, Jokepad lets you
                store, edit, and perfect jokes. Sharpen your material for your
                next performance.
              </p>
            </div>
          </div>
        </section>

        <section className="card-style bg-zinc-900 text-zinc-200 p-4 rounded-xl shadow-md flex flex-col items-center">
          <h2 className="title-style text-2xl font-bold mb-4 text-center drop-shadow-md">
            Mic Finder!
          </h2>
          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div className="flex-1 text-center items-center md:text-right">
              <p className="mb-4">
                Ready to perform? Use MicFinder to discover over 1000 open mic
                events in 200+ cities, updated weekly. Whether it&#39;s comedy,
                music, or poetry, MicFinder helps you find the perfect stage.
                Start performing today.
              </p>

              <Suspense fallback={<div>Loading...</div>}>
                <EventForm />
              </Suspense>
            </div>
            <div className="md:w-1/2 flex flex-col items-center justify-center mb-4 md:mb-0">
              <Link href="/MicFinder">
                <Image
                  src={micFinder}
                  alt="Mic Finder"
                  width={200}
                  height={200}
                  className="rounded-xl shadow-lg cursor-pointer"
                  loading="lazy"
                  style={{ objectFit: "contain", maxWidth: "100%" }}
                  sizes="(max-width: 768px) 90vw, 250px"
                  onClick={() => {
                    sendDataLayerEvent("click_micfinder_image", {
                      event_category: "Navigation",
                      event_label: "MicFinder Image",
                    });
                  }}
                />
              </Link>
              <Link href="/MicFinder">
                <span
                  className="btn inline-block text-lg items-center py-2 px-4 mt-6 hover:bg-blue-700 transition-colors cursor-pointer"
                  onClick={() => {
                    sendDataLayerEvent("click_micfinder_button", {
                      event_category: "Navigation",
                      event_label: "MicFinder Button",
                    });
                  }}
                >
                  Find My Mic
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
