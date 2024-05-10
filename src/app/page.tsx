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
        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md flex flex-col md:flex-row items-center">
          <div className="flex-1 text-center md:text-left md:order-1">
            <h1 className="title-style text-2xl font-bold mb-4 drop-shadow-md">
              Mic Finder!
            </h1>
            <h2 className="mb-4 text-xl">
              Discover and share stages for comedy, music, and poetry with Mic
              Finder, your ultimate platform to connect talent with live
              performance venues.
            </h2>
            <Suspense fallback={<div>Loading...</div>}>
              <EventForm />
            </Suspense>
          </div>
          <div className="md:w-1/2 flex justify-center mb-4 md:mb-0 md:order-2">
            <Link href="/ComicBot">
              <Image
                src={micFinder} // Ensure this variable is correctly defined and imported
                alt="Mic Finder Image"
                width={200} // Assuming a more appropriate size; adjust as necessary
                height={200} // Assuming a more appropriate size; adjust as necessary
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>
          </div>
        </section>

        <section>
          <div className="screen-container p-10 m-6 flex flex-col md:flex-row md:items-center md:justify-center">
            <div className="md:w-1/2 flex justify-center mb-4 md:mb-0">
              <Link href="/ComicBot">
                <Image
                  src={ComicBot}
                  alt="ComicBot - Your Comedy Genius Assistant"
                  width={200}
                  height={200} // Corrected the height for a more square aspect
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
            <div className="flex-1 text-center md:text-left md:ml-4">
              <h2 className="title-style text-3xl font-bold mb-4">
                Meet ComicBot
              </h2>
              <h3 className="subtitle-style font-semibold mb-2">
                Your Comedy Genius Assistant!
              </h3>
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

        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md">
          <div className="screen-container p-10 m-6 flex flex-col md:flex-row-reverse md:items-center md:justify-center">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="title-style text-3xl font-bold mb-4">
                Jokepad: Your Ultimate Comedy Workshop
              </h2>
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
              <div className="flex justify-center md:justify-start mb-4">
                <Link href="/JokePad">
                  <button className="btn inline-block text-lg py-2 px-4 hover:bg-green-700 transition-colors">
                    Explore Jokepad Now
                  </button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center mb-4 md:mb-0">
              <Link href="/JokePad">
                <Image
                  src={jokes}
                  alt="Jokepad - Your Ultimate Comedy Workshop"
                  width={250}
                  height={250}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
