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
        src="https://www.googletagmanager.com/gtag/js?id=G-L4N0VS2TW8"
      ></Script>
      <Header />
      <div className="screen-container">
        <section data-aos="fade-up">
          <HumorHubAPISection />
        </section>

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
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 250px"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Meet ComicBot: your AI-powered comedy companion, designed to
                deliver the funniest jokes, puns, and humor at the touch of a
                button. Trained on stand-up comedy and optimized for both new
                and experienced comedians, ComicBot uses advanced AI comedy
                technology to bring you sharp, stage-ready material, whether you
                need a quick punchline, a witty one-liner, or a fresh routine.
              </p>
              <br />
              <p className="mb-4">
                Built for stand-up comedians and humor enthusiasts alike,
                ComicBot is your go-to tool for generating new jokes, refining
                your comedy act, and bringing AI humor to life. Whether
                you&#39;re on the road, looking for last-minute ideas, or simply
                in need of a laugh, ComicBot offers the best AI-powered funny
                bot experience, perfect for creating and organizing your comedy
                material.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the div&#39;s click event from firing
                  if (!isUserSignedIn) {
                    setIsAuthModalOpen(true); // Open AuthModal if not signed in
                  } else {
                    location.href = "/ComicBot";
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
                if (isUserSignedIn) {
                  location.href = "/JokePad";
                } else {
                  setIsAuthModalOpen(true); // Open AuthModal if not signed in
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
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 250px"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the div&#39;s click event from firing
                  if (!isUserSignedIn) {
                    setIsAuthModalOpen(true); // Open AuthModal if not signed in
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
                Jokepad is your ultimate comedy writing tool, transforming
                spontaneous ideas into a well-organized, cloud-synced library of
                jokes. Whether you&#39;re refining punchlines or brainstorming
                fresh humor, Jokepad keeps your comedy content ready when
                inspiration strikes.
              </p>
              <p className="mb-4">
                With a user-friendly interface and secure cloud-sync technology,
                Jokepad allows comedians to store, edit, and perfect jokes and
                one-liners. It&#39;s designed to help you sharpen your humor
                writing and prepare your material for your next performance.
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
                Refined your material with ComicBot? Use MicFinder to find the
                best open mic events near you. Whether it&#39;s comedy, music,
                or poetry, MicFinder helps comedians and performers locate live
                open mic venues across the US, giving you the perfect stage to
                bring your new set to life. Discover top-rated open mics and
                local comedy shows near you, and start performing today.
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
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 100vw, 250px"
                />
              </Link>
              <Link href="/MicFinder">
                <span className="btn inline-block text-lg items-center py-2 px-4 mt-6 hover:bg-blue-700 transition-colors cursor-pointer">
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
