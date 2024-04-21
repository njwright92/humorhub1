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
        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md">
          <h1 className="title-style text-2xl font-bold text-center mb-4 drop-shadow-md">
            Mic Finder!
          </h1>
          <h2 className="text-center mb-4 text-xl">
            Your ultimate gateway to discover, share, and shine in the world of
            stand-up comedy, live music, and poetic performances. Mic Finder
            bridges the gap between talent and stage, offering a platform where
            artists can truly flourish.
          </h2>

          <div className="space-y-6 mb-6">
            <h3 className="subtitle-style font-semibold mb-2">
              Find Your Stage:
            </h3>
            <p className="mb-4">
              Ready to take the spotlight? Mic Finder is your key to unlocking a
              world brimming with opportunities. We specialize in connecting you
              to an extensive range of open mic events tailored just for artists
              like you - whether you&rsquo;re a humorist, poet, or musician.
              Dive into the vibrant local and national art scenes with a tool
              designed to make your search for the perfect stage as easy as a
              click.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Explore a curated selection of venues, from intimate coffee
                shops to grand theaters, and find stages that resonate with your
                creative spirit. Mic Finder is your compass to navigating the
                vast world of open mic nights, bringing you closer to your
                audience.
              </li>
              <li>
                With our seamless, intuitive interface, searching for events by
                location, date, or type of performance is a breeze. Filter your
                options to match your unique artistic style and preferences,
                ensuring every performance is a step towards fulfilling your
                dreams.
              </li>
              <li>
                Stay ahead of the game with real-time updates on the latest open
                mic opportunities. Our platform ensures you&rsquo;re always in
                the loop, ready to make your mark on the stage whenever
                inspiration strikes.
              </li>
            </ul>

            <h3 className="subtitle-style font-semibold mb-2">
              Connect and Grow:
            </h3>
            <p className="mb-4">
              At Mic Finder, we believe in the power of community. Join a
              network of passionate artists and performance enthusiasts who are
              just as excited about live art as you are. This is a space to
              connect, share, and grow together; a sanctuary where artistic
              dreams are nurtured and celebrated.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Immerse yourself in a supportive ecosystem of artists who
                understand the exhilaration and challenges of live performance.
                Exchange stories, gain invaluable insights, and elevate your
                craft by learning from the collective wisdom of your peers.
              </li>
              <li>
                Discover potential collaborators to broaden your artistic
                horizon. Whether it&rsquo;s a joint performance or a creative
                project, Mic Finder makes it easy to connect with like-minded
                artists and explore new possibilities.
              </li>
              <li>
                Benefit from a culture of feedback and support. Celebrate your
                triumphs, navigate challenges with constructive advice, and
                evolve as an artist with a community that cheers you on every
                step of the way.
              </li>
            </ul>

            <h3 className="subtitle-style font-semibold mb-2">
              Promote Your Event:
            </h3>
            <p className="mb-4">
              Got an open mic night coming up? Let Mic Finder be your megaphone.
              Our platform offers targeted advertising and unparalleled
              visibility among a dedicated audience of performers and art
              lovers. Ensure your event not only reaches the right crowd but
              also leaves a lasting impact.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Craft compelling listings that highlight the uniqueness of your
                event. Showcase your venue, talent lineup, and special features
                to attract performers and attendees who are eager for a
                memorable experience.
              </li>
              <li>
                Take advantage of our integrated social media tools to boost
                your event&rsquo;s profile. Spread the word with ease and watch
                as your event becomes the talk of the town.
              </li>
              <li>
                Utilize our analytics features to measure your event&rsquo;s
                success. Understand your audience better, fine-tune future
                events based on feedback, and continuously deliver experiences
                that resonate with your community.
              </li>
            </ul>

            <h3 className="subtitle-style font-semibold mb-2">
              Step into the Spotlight:
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Mic Finder is not just a platform; it&rsquo;s a launchpad for
                talent waiting to be discovered. Whether you&rsquo;re taking
                your first steps into comedy, music, or poetry, we connect you
                with venues eager to host new and vibrant artists. Here, your
                talent gets the recognition it deserves.
              </li>
              <li>
                Utilizing our platform&rsquo;s intuitive navigation, you can
                find events that perfectly match your artistic style and
                preferences. It&rsquo;s about making every performance
                opportunity a stepping stone to greater achievements.
              </li>
            </ul>
          </div>
          <EventForm />

          <p className="text-center">
            <Link href="mailto:nitronate@gmail.com">
              <button className="btn inline-block text-lg py-2 px-4 hover:bg-blue-700 transition-colors">
                Contact me with questions or issues
              </button>
            </Link>
          </p>

          <div className="text-center">
            <Link href="/MicFinder">
              <button className="btn inline-block text-lg py-2 px-4 hover:bg-green-700 transition-colors">
                Explore Mic Finder
              </button>
            </Link>
          </div>
        </section>
        <section
          className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md"
          data-aos="fade-up"
        >
          <h2 className="title-style text-3xl font-bold text-center mb-4">
            Meet ComicBot
          </h2>
          <h3 className="subtitle-style font-semibold mb-2">
            Your Comedy Genius Assistant!
          </h3>
          <div className="text-center items-center">
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="mb-4">
                Imagine having a co-writer who never sleeps, eats, or takes a
                break — that&rsquo;s ComicBot for you. Powered by the latest in
                GPT technology, ComicBot is designed to be your round-the-clock
                partner in comedy, ready to help you brainstorm, develop, and
                polish your sketches until they shine. Whether you&rsquo;re
                stuck on a punchline or need a fresh set of comedic ideas,
                ComicBot is always on hand to inspire.
              </li>
              <li className="mb-4">
                But ComicBot is more than just an assistant; it&rsquo;s a
                creative collaborator that brings a new level of wit and humor
                to your writing process. Engage in dynamic, back-and-forth
                dialogues that challenge you to push the boundaries of your
                comedic talent. From the seed of an idea to a fully-fledged
                routine, ComicBot is there to support every step of your
                creative journey.
              </li>
              <li className="mb-4">
                Perfect for stand-up comedians looking to refresh their set,
                writers aiming to add a comedic twist to their work, or anyone
                in between. ComicBot adapts to your style and needs, offering
                personalized suggestions that resonate with your unique voice.
                Plus, with endless humor and a knack for the craft, ComicBot
                could well be the secret weapon that sets your performance
                apart.
              </li>
            </ul>
            <div className="flex justify-center mb-4">
              <Link href="/ComicBot">
                <Image
                  src={ComicBot}
                  alt="ComicBot - Your Comedy Genius Assistant"
                  width={350}
                  height={350}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
            <p className="mb-4">
              Don&rsquo;t let writer&rsquo;s block or routine fatigue hold you
              back. Unlock the full potential of your comedic prowess with
              ComicBot and bring laughter to the world one joke at a time.
              Whether you&rsquo;re gearing up for a big show or simply love
              crafting jokes, ComicBot is the perfect partner in comedy.
            </p>
            <Link href="/ComicBot">
              <button className="btn inline-block text-lg py-2 px-4 hover:bg-blue-700 transition-colors">
                Unlock Your Creative Side with ComicBot
              </button>
            </Link>
          </div>
        </section>

        <section
          className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl shadow-md"
          data-aos="fade-up"
        >
          <h2 className="title-style text-3xl font-bold text-center mb-4">
            Jokepad: Your Ultimate Comedy Workshop
          </h2>
          <div className="text-center">
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Discover Jokepad, a comprehensive creative workshop tailored for
                comedians, writers, and anyone passionate about humor.
                It&rsquo;s not just a notepad; it&rsquo;s your personal comedy
                archive.
              </li>
              <li>
                Effortlessly capture spur-of-the-moment inspirations with a
                platform that&rsquo;s been meticulously designed for humorists.
                Jokepad transforms your fleeting thoughts into a meticulously
                organized library of laughs.
              </li>
              <li>
                Say goodbye to the panic of forgotten punchlines. With
                cloud-sync technology, your jokes, one-liners, and stories are
                securely stored and accessible across all your devices, whenever
                inspiration strikes.
              </li>
              <li>
                Jokepad’s user-friendly interface ensures that no idea is too
                small or fleeting. Every thought counts, and with Jokepad, each
                one is a potential comedic gem.
              </li>
              <li>
                Beyond just storage, Jokepad offers tools for refining and
                developing your material. Track the evolution of your jokes from
                a basic premise to a polished performance piece.
              </li>
              <li>
                Connect and collaborate with a community of like-minded
                humorists. Share drafts, receive feedback, and discover new
                comedic perspectives within a supportive and creative
                environment.
              </li>
              <li>
                Never let a brilliant idea slip through the cracks again. With
                Jokepad, your comedy writing process is seamless, secure, and
                infinitely more creative.
              </li>
            </ul>
            <div className="flex justify-center mb-4">
              <Link href="/JokePad">
                <Image
                  src={jokes}
                  alt="Jokepad - Your Ultimate Comedy Workshop"
                  width={350}
                  height={350}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
            <Link href="/JokePad">
              <button className="btn inline-block text-lg py-2 px-4 hover:bg-green-700 transition-colors">
                Explore Jokepad Now
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
