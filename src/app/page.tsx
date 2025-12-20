import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";
import news from "../app/news1.webp";

const EventForm = dynamic(() => import("./components/EventForm"), {
  loading: () => (
    <span
      aria-busy="true"
      aria-live="polite"
      className="inline-block w-80 rounded-2xl px-2 py-1 text-lg font-semibold text-zinc-200"
    >
      Loading…
    </span>
  ),
});
const NewsButton = dynamic(() => import("./components/newsButton"));

export const metadata: Metadata = {
  title: "Humor Hub - The Hub of Humor, Open Mics & Comedy",
  description:
    "Your ultimate comedy destination. Find open mics, discover jokes, and connect with the comedy community at Humor Hub.",
  keywords: [
    "comedy platform",
    "stand-up comedy",
    "funny jokes",
    "puns",
    "open mic events",
    "humor content",
    "comedy community",
    "comedy tools",
  ],
  openGraph: {
    title: "Humor Hub - The Hub of Humor, Open Mics & Comedy",
    description:
      "Your ultimate comedy destination. Find open mics, discover jokes, and connect with the comedy community.",
    url: "https://www.thehumorhub.com/",
    type: "website",
  },
  alternates: {
    canonical: "https://www.thehumorhub.com/",
  },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 text-center md:ml-20">
      <h1 className="font-heading animate-slide-in mb-6 hidden text-6xl font-bold tracking-wide md:block">
        Humor Hub!
      </h1>

      {/* Mic Finder Section */}
      <section
        aria-labelledby="micfinder-heading"
        className="mx-auto my-8 w-full grow rounded-2xl p-2 shadow-lg"
      >
        <h2
          id="micfinder-heading"
          className="font-heading mt-10 mb-8 text-4xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:mb-10 sm:text-5xl md:text-6xl"
        >
          Mic Finder!
        </h2>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-1 flex-col items-center space-y-6 text-center md:items-start md:text-left">
            <p className="max-w-lg text-sm leading-relaxed text-shadow-sm sm:text-base lg:text-lg">
              Looking for your next Mic?
              <br />
              MicFinder connects comics and all artists with open mics
              worldwide! Explore 1,000s of listings and get on stage!
            </p>

            <EventForm />

            <Link
              href="/MicFinder"
              className="w-80 rounded-2xl bg-amber-700 px-2 py-1 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:outline hover:outline-white"
            >
              Find Your Mic!
            </Link>
          </div>
          <figure className="flex flex-1 justify-center md:justify-end">
            <Link href="/MicFinder" className="group">
              <Image
                src={micFinder}
                alt="Mic Finder - Find open mics near you"
                className="h-32 w-32 rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 md:h-42 md:w-42"
                priority
                fetchPriority="high"
              />
            </Link>
          </figure>
        </div>
      </section>

      {/* Hub News Section */}
      <section
        aria-labelledby="news-heading"
        className="mx-auto my-8 w-full grow rounded-2xl p-2 shadow-lg"
      >
        <h2
          id="news-heading"
          className="font-heading mt-10 mb-8 text-4xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:mb-10 sm:text-5xl md:text-6xl"
        >
          Hub News!
        </h2>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row-reverse">
          <div className="flex flex-1 flex-col items-center space-y-6 text-center md:items-end md:text-right">
            <p className="max-w-lg text-sm leading-relaxed text-shadow-sm sm:text-base md:text-lg">
              Your Source for Fresh Headlines!
              <br />
              Looking for something topical?
              <br />
              <span className="mt-2 block">
                Check out the Hub News for the latest updates!
              </span>
            </p>
            <NewsButton />
          </div>
          <figure className="flex flex-1 justify-center md:justify-start">
            <NewsButton className="group border-0 bg-transparent p-0">
              <Image
                src={news}
                alt="Hub News - Latest comedy headlines"
                className="h-32 w-32 rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 md:h-44 md:w-44"
                quality={70}
              />
            </NewsButton>
          </figure>
        </div>
      </section>
    </main>
  );
}
