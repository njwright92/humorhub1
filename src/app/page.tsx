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

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);
  const HumorHubAPISection: React.FC = () => {
    const exampleTweets = [
      {
        username: "@comedy_fan123",
        content:
          "Just discovered this hilarious joke via Humor Hub API! 😂 #ComedyGold",
      },
    ];

    const exampleNewsPosts = [
      {
        title: "Breaking Comedy News: Stand-Up Revolution!",
        content: "Latest comedy trends analyzed by Humor Hub API...",
      },
    ];
    return (
      <div className="card-style" data-aos="fade-up">
        <h1 className="title-style">Humor Hub API</h1>
        <p>
          Receive the latest in news, politics, comedy, and more. Customize to
          your preference.
        </p>

        <h2 className="subtitle-style mb-2 mt-4">See What&apos;s Trending!</h2>
        {exampleTweets.map((tweet, index) => (
          <div key={index} className="border p-2 rounded-lg">
            <p className="font-bold">{tweet.username}</p>
            <p>{tweet.content}</p>
          </div>
        ))}

        <h2 className="subtitle-style mb-2 mt-4">Latest Comedy News!</h2>
        {exampleNewsPosts.map((post, index) => (
          <div key={index} className="border p-2 rounded-lg">
            <h4 className="font-bold">{post.title}</h4>
            <p>{post.content}</p>
          </div>
        ))}

        <Link href="/api-signup">
          <button className="btn">Subsribe for our API</button>
        </Link>
      </div>
    );
  };

  return (
    <main className="screen-container">
      <Header />
      <h1 className="title">Humor Hub!</h1>
      <p className="text-xl text-beige">
        The go-to platform for comedy. Keep scrolling to see the full benefits
        of this platform!
      </p>

      <section className="card-style" data-aos="fade-up">
        <h2 className="title-style">Mic Finder!</h2>
        <p className="text-center mb-4">
          Discover and share open mic events - your stepping stone in the world
          of stand-up comedy and live performances.
        </p>

        <section className="mb-6">
          <h3 className="subtitle-style">Find Your Stage:</h3>
          <p>
            Browse through an array of open mic events tailored to comedians,
            poets, and musicians. OpenMicFinder is your gateway to experiencing
            and participating in the thriving local art scene.
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
            Whether you&apos;re a budding comedian, a poet, or a musician,
            OpenMicFinder is your platform to shine. Find events that resonate
            with your art and let the world be your audience.
          </p>
        </section>
        <div>
          <Link href="/Mic Finder">
            <button className="btn">Explore OpenMic Finder</button>
          </Link>
        </div>
      </section>

      <section className="card-style mt-10 p-1" data-aos="fade-up">
        <h2 className="title-style">ComicBot</h2>
        <div className="flex flex-col items-center">
          <p className="mb-4">
            Your personal comedy bit creation assistant fine-tuned from a llm on
            comedy scripts. Utilizing cutting-edge GPT technology, ComicBot
            engages you in a conversational interface to help you craft the
            funniest bits. It&apos;s like having a writing partner who&apos;s
            always in a funny mood. Sign up to get access!
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
            With Comedify, you can unleash your comedy genius by writing and
            working on jokes and bits. Our platform provides a creative space to
            refine your material and take your comedy to the next level! Sign up
            to get access!
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
      <Footer data-aos="fade-up" />
    </main>
  );
}
