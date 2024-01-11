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
        <h1 className="title">Humor Hub!</h1>
        <p className="text-xl">
          The go-to platform for comedy. Keep scrolling to see the full benefits
          of this platform!
        </p>

        <section className="card-style" data-aos="fade-up">
          <h2 className="title-style">Mic Finder!</h2>
          <p className="text-center mb-4">
            Discover and share open mic events - your stepping stone in the
            world of stand-up comedy and live performances.
          </p>

          <section className="mb-6">
            <h3 className="subtitle-style">Find Your Stage:</h3>
            <p>
              Browse through an array of open mic events tailored to comedians,
              poets, and musicians. OpenMicFinder is your gateway to
              experiencing and participating in the thriving local art scene.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="subtitle-style">Connect and Grow:</h3>
            <p>
              Join a community of artists and enthusiasts. Share stories, gather
              insights, and forge connections in a space dedicated to the growth
              and celebration of live artistic expression.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="subtitle-style">Promote Your Event:</h3>
            <p className="mb-2">
              Got an open mic event? Let OpenMicFinder amplify your reach. With
              targeted advertising and visibility among a passionate audience,
              your event is set for greater engagement and success.
            </p>
            <p className="mt-2">
              <Link href="mailto:nitronate@gmail.com">
                <button className="btn">
                  Contact me with questions or issues
                </button>
              </Link>
            </p>
            <EventForm />
          </section>

          <section className="mb-6">
            <h3 className="subtitle-style">Step into the Spotlight:</h3>
            <p>
              Whether you're a budding comedian, a poet, or a musician,
              OpenMicFinder is your gateway to visibility. Our platform connects
              performers with venues hosting open mic events. Showcase your
              talent, grow your fan base, and network with other artists.
            </p>
            <p>
              Our user-friendly interface allows you to effortlessly search for
              open mic events based on location, date, and performance type.
              This ensures that you find the perfect stage that aligns with your
              artistic style and preferences.
            </p>
          </section>
          <div>
            <Link href="/MicFinder">
              <button className="btn">Explore Mic Finder</button>
            </Link>
          </div>
        </section>
        <section className="card-style" data-aos="fade-up">
          <h2 className="title-style">ComicBot</h2>
          <div className="flex flex-col items-center">
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

            <Link href="/ComicBot">
              <Image
                src={ComicBot}
                alt="comicbot"
                width={350}
                height={350}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>

            <Link href="/ComicBot">
              <button className="btn">Discover ComicBot</button>
            </Link>
          </div>
        </section>

        <section className="card-style" data-aos="fade-up">
          <h2 className="title-style">Jokepad</h2>
          <div className="flex flex-col items-center">
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

            <Link href="/JokePad">
              <Image
                src={jokes}
                alt="Jokes"
                width={350}
                height={350}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>

            <Link href="/JokePad">
              <button className="btn">Visit Jokepad</button>
            </Link>
          </div>
        </section>

        <section>
          <HumorHubAPISection />
        </section>
      </div>
      <Footer data-aos="fade-up" />
    </>
  );
}
