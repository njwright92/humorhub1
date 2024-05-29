"use client";

import Image from "next/image";
import ComicBot from "../app/Comics.webp";
import jokes from "../app/jokes.webp";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import HumorHubAPISection from "./components/humorHubApi";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";
import Guide from "./components/guide";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useCallback, useState } from "react";
import Link from "next/link";

const EventForm = dynamic(() => import("./components/EventForm"));

export default function Home() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

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
              onClick={() =>
                isUserSignedIn
                  ? (location.href = "/ComicBot")
                  : alert(
                      "You need to be signed in to access this page. Please sign in or create an account."
                    )
              }
            >
              <Image
                src={ComicBot}
                alt="ComicBot - Your Comedy Genius Assistant"
                width={250}
                height={250}
                className="rounded-xl shadow-lg"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Elevate your comedy with ComicBot, your AI co-writer that&#39;s
                always ready to brainstorm and enhance your sketches, helping
                you perfect your punchlines and creative ideas at any moment.
              </p>
              <p className="mb-4">
                From refining jokes to crafting entire routines, ComicBot is
                your partner in bringing comedy to life, making it indispensable
                for comedians and writers seeking a unique edge in their
                creative work.
              </p>
              <button
                onClick={() => {
                  if (!isUserSignedIn) {
                    alert(
                      "You need to be signed in to access this page. Please sign in or create an account."
                    );
                  } else {
                    location.href = "/ComicBot";
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
              onClick={() =>
                isUserSignedIn
                  ? (location.href = "/JokePad")
                  : alert(
                      "You need to be signed in to access this page. Please sign in or create an account."
                    )
              }
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
                    alert(
                      "You need to be signed in to access this page. Please sign in or create an account."
                    );
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
                Jokepad is your personal comedy archive, transforming
                spontaneous inspirations into an organized library of laughs,
                ready whenever inspiration strikes.
              </p>
              <p className="mb-4">
                With cloud-sync technology and a user-friendly interface,
                Jokepad secures your jokes and one-liners, making every comedic
                thought count towards your next great performance.
              </p>
            </div>
          </div>
        </section>

        <section className="card-style bg-zinc-900 text-zinc-200 p-4 rounded-xl shadow-md flex flex-col items-center">
          <h1 className="title-style text-2xl font-bold mb-4 text-center drop-shadow-md">
            Mic Finder!
          </h1>
          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div className="flex-1 text-center items-center md:text-right">
              <h2 className="mb-4 text-xl">
                Discover and share stages for comedy, music, and poetry with Mic
                Finder, your ultimate platform to connect talent with live
                performance venues.
              </h2>
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

        <Guide />
      </div>
      <Footer />
    </>
  );
}
