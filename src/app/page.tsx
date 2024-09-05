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
import ComicBotModal from "./components/comicBotModal";
import AuthModal from "./components/authModal";
import Link from "next/link";
import Head from "next/head";
import Script from "next/script";

const EventForm = dynamic(() => import("./components/EventForm"));

export default function Home() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isComicBotModalOpen, setIsComicBotModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthStateChanged = useCallback((user: User | null) => {
    setIsUserSignedIn(!!user);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
    const auth = getAuth();
    return onAuthStateChanged(auth, handleAuthStateChanged);
  }, [handleAuthStateChanged]);

  return (
    <>
      <Head>
        <title>Humor Hub the go to platfrorm for everything comedy!</title>
        <meta
          name="description"
          content="Discover the ultimate destination for everything comedy. Explore jokes, puns, open mic events, and more at Humor Hub."
        />
        <meta
          name="keywords"
          content="comedy, humor, funny, jokes, puns, open mic, comedy events"
        />
        <meta
          property="og:title"
          content="Humor Hub the go to platfrorm for everything comedy!"
        />
        <meta
          property="og:description"
          content="Discover the ultimate destination for everything comedy. Explore jokes, puns, open mic events, and more at Humor Hub."
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
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Meet ComicBot: your AI-powered comedy companion, trained on
                stand-up humor and designed to deliver the funniest jokes and
                humor at the touch of a button. Whether you need a quick
                punchline, a witty one-liner, or a fresh routine, ComicBot uses
                AI comedy to bring you sharp, stage-ready material whenever you
                need it.
              </p>
              <br />
              <p className="mb-4">
                Built for comedians and humor enthusiasts alike, ComicBot is
                your go-to tool for generating new jokes, refining your comedy
                act, and bringing AI humor to life. Perfect for on-the-road
                inspiration, last-minute ideas, or simply for a good laugh with
                the best AI-powered funny bot available.
              </p>

              <button
                onClick={() => {
                  if (isUserSignedIn) {
                    setIsComicBotModalOpen(true);
                  } else {
                    setIsAuthModalOpen(true); // Open AuthModal if not signed in
                  }
                }}
                className="btn inline-block text-lg py-2 px-4 hover:bg-blue-700 transition-colors"
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
                className="rounded-xl shadow-lg"
              />
              <button
                onClick={() => {
                  if (!isUserSignedIn) {
                    setIsAuthModalOpen(true); // Open AuthModal if not signed in
                  } else {
                    location.href = "/JokePad";
                  }
                }}
                className="btn inline-block text-lg py-2 px-4 hover:bg-green-700 transition-colors mt-4"
              >
                Explore Jokepad Now
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Jokepad is your personal comedy writing tool, turning
                spontaneous ideas into a well-organized library of jokes, always
                ready when inspiration hits.
              </p>
              <p className="mb-4">
                With cloud-sync and a user-friendly interface, Jokepad securely
                stores your jokes and one-liners, helping you refine and perfect
                your humor for your next performance.
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
              <h3 className="mb-4 text-xl">
                Refined your material with ComicBot? Use MicFinder to find the
                best open mic events near you. Whether it&apos;s comedy, music,
                or poetry, MicFinder connects you to live performance venues
                where you can bring your new set to life.
              </h3>

              <Suspense fallback={<div>Loading...</div>}>
                <EventForm />
              </Suspense>
            </div>
            <div className="md:w-1/2 flex flex-col items-center justify-center mb-4 md:mb-0">
              <Link href="/MicFinder">
                <Image
                  src={micFinder}
                  alt="Mic Finder Image"
                  width={200}
                  height={200}
                  className="rounded-xl shadow-lg"
                />
              </Link>
              <Link href="/MicFinder">
                <span className="btn inline-block text-lg items-center py-2 px-4 mt-6 hover:bg-blue-700 transition-colors">
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
