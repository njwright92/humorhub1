"use client";

import Image from "next/image";
import Link from "next/link";
import EventForm from "./components/EventForm";
import ComicBot from "../app/Comics.webp";
import jokes from "../app/jokes.webp";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import HumorHubAPISection from "./components/humorHubApi";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);

  return (
    <>
      <Header />
      <div className="screen-container">
        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl drop-shadow-md">
          <h2 className="title-style text-2xl font-bold text-center mb-4">
            Mic Finder!
          </h2>
          <p className="text-center mb-4">
            Discover and share open mic events - your stepping stone in the
            world of stand-up comedy and live performances.
          </p>

          <div className="space-y-6 mb-6">
            <h3 className="subtitle-style font-semibold mb-2">
              Find Your Stage:
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Browse through an array of open mic events tailored to
                comedians, poets, and musicians. OpenMicFinder is your gateway
                to experiencing and participating in the thriving local art
                scene.
              </li>
            </ul>

            <h3 className="subtitle-style font-semibold mb-2">
              Connect and Grow:
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Join a community of artists and enthusiasts. Share stories,
                gather insights, and forge connections in a space dedicated to
                the growth and celebration of live artistic expression.
              </li>
            </ul>

            <h3 className="subtitle-style font-semibold mb-2">
              Promote Your Event:
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Got an open mic event? Let OpenMicFinder amplify your reach.
                With targeted advertising and visibility among a passionate
                audience, your event is set for greater engagement and success.
              </li>
            </ul>

            <h3 className="subtitle-style font-semibold mb-2">
              Step into the Spotlight:
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Whether you're a budding comedian, a poet, or a musician,
                OpenMicFinder is your gateway to visibility. Our platform
                connects performers with venues hosting open mic events.
                Showcase your talent, grow your fan base, and network with other
                artists.
              </li>
              <li>
                Our user-friendly interface allows you to effortlessly search
                for open mic events based on location, date, and performance
                type. This ensures that you find the perfect stage that aligns
                with your artistic style and preferences.
              </li>
            </ul>
          </div>

          <EventForm />

          <p className="text-center">
            <Link href="mailto:nitronate@gmail.com">
              <button className="btn inline-block bg-blue-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                Contact me with questions or issues
              </button>
            </Link>
          </p>

          <div className="text-center">
            <Link href="/MicFinder">
              <button className="btn inline-block bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
                Explore Mic Finder
              </button>
            </Link>
          </div>
        </section>
        <section
          className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl drop-shadow-md"
          data-aos="fade-up"
        >
          <h2 className="title-style text-2xl font-bold text-center mb-4">
            ComicBot
          </h2>
          <div className="text-center items-center">
            <p className="mb-4">
              Your personal comedy bit creation assistant, ComicBot, is powered
              by state-of-the-art GPT technology. It simulates a collaborative
              writing experience, helping you brainstorm and refine your comedy
              sketches.
            </p>
            <p className="mb-4">
              Engage in witty and creative dialogues with ComicBot to develop
              unique and hilarious comedy routines. Whether you're preparing for
              a stand-up show or just seeking to enhance your comedic skills,
              ComicBot is your ideal partner.
            </p>
            <div className="flex justify-center">
              <Link href="/ComicBot">
                <Image
                  src={ComicBot}
                  alt="comicbot"
                  width={350}
                  height={350}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
            <Link href="/ComicBot">
              <button className="btn inline-block bg-blue-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                Discover ComicBot
              </button>
            </Link>
          </div>
        </section>

        <section
          className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl drop-shadow-md"
          data-aos="fade-up"
        >
          <h2 className="title-style text-2xl font-bold text-center mb-4">
            Jokepad
          </h2>
          <div className="text-center">
            <p className="mb-4">
              With Jokepad, immerse yourself in a creative hub designed for
              comedians and writers. Our platform is a sanctuary for your
              humorous thoughts, where you can jot down, organize, and refine
              your jokes and comedic stories.
            </p>
            <p className="mb-4">
              Never lose a brilliant idea again, as Jokepad securely syncs your
              content to the cloud. This ensures that your jokes and notes are
              always accessible, anytime and anywhere. Its user-friendly
              interface makes it simple to capture every fleeting thought and
              turn it into comedic gold.
            </p>
            <div className="flex justify-center">
              <Link href="/JokePad">
                <Image
                  src={jokes}
                  alt="Jokes"
                  width={350}
                  height={350}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
            <Link href="/JokePad">
              <button className="btn inline-block bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
                Visit Jokepad
              </button>
            </Link>
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
