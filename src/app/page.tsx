"use client";

import Image from "next/image";
import Link from "next/link";
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

const EventForm = dynamic(() => import("./components/EventForm"));

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);

  return (
    <>
      <Header />
      <div className="screen-container p-10 m-6">
        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md flex flex-col items-center">
          <h1 className="title-style text-2xl font-bold mb-4 text-center drop-shadow-md">
            Mic Finder!
          </h1>
          <div className="flex flex-col md:flex-row items-center w-full">
            <div className="flex-1 text-center md:text-left">
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
              <Link href="/MicFinder">
                <button className="btn inline-block text-lg py-2 px-4 mt-6 hover:bg-blue-700 transition-colors">
                  Find My Mic
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section
          data-aos="fade-up"
          className="card-style flex flex-col items-center w-full p-8"
        >
          <h2 className="title-style text-3xl font-bold mb-4 text-center">
            Meet ComicBot
          </h2>
          <h3 className="text-xl font-semibold mb-6">
            Your Comedy Genius Assistant!
          </h3>
          <div className="md:flex-row flex flex-col-reverse md:items-center md:justify-center w-full">
            <div className="md:w-1/2 flex justify-center mb-4 md:mb-0">
              <Link href="/ComicBot">
                <Image
                  src={ComicBot}
                  alt="ComicBot - Your Comedy Genius Assistant"
                  width={250}
                  height={250}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="mb-4">
                Elevate your comedy with ComicBot, your AI co-writer that’s
                always ready to brainstorm and enhance your sketches, helping
                you perfect your punchlines and creative ideas at any moment.
              </p>
              <p className="mb-4">
                From refining jokes to crafting entire routines, ComicBot is
                your partner in bringing comedy to life, making it indispensable
                for comedians and writers seeking a unique edge in their
                creative work.
              </p>
              <Link href="/ComicBot">
                <button className="btn inline-block text-lg py-2 px-4 hover:bg-blue-700 transition-colors">
                  Unlock Your Creative Side with ComicBot
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section
          data-aos="fade-up"
          className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md flex flex-col items-center"
        >
          <h2 className="title-style text-3xl font-bold mb-6 text-center">
            Jokepad
          </h2>
          <h3 className="text-xl font-bold mb-6 text-center">
            {" "}
            Your Ultimate Comedy Workshop
          </h3>
          <div className="flex flex-col md:flex-row-reverse items-center w-full">
            <div className="md:w-1/2 flex flex-col items-center justify-center mb-4 md:mb-0">
              <Link href="/JokePad">
                <Image
                  src={jokes}
                  alt="Jokepad - Your Ultimate Comedy Workshop"
                  width={250}
                  height={250}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
              <Link href="/JokePad">
                <button className="btn inline-block text-lg py-2 px-4 hover:bg-green-700 transition-colors mt-4">
                  Explore Jokepad Now
                </button>
              </Link>
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
        <Guide />
        <section data-aos="fade-up">
          <HumorHubAPISection />
        </section>
      </div>
      <Footer />
    </>
  );
}
