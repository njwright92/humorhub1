import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import micFinder from "../app/micFinder.webp";
import news from "../app/news1.webp";
import Header from "./components/header";
import Footer from "./components/footer";

const EventForm = dynamic(() => import("./components/EventForm"), {
  loading: () => (
    <button
      className="cursor-wait rounded-2xl bg-green-600 px-2 py-1 text-lg font-bold tracking-wide text-zinc-950 opacity-80 shadow-lg"
      aria-busy="true"
      aria-label="Loading event form"
    >
      Add Your Event
    </button>
  ),
});

const NewsButton = dynamic(() => import("./components/newsButton"), {
  loading: () => (
    <button
      className="w-80 cursor-wait self-center rounded-2xl bg-amber-700 px-2 py-1 text-center text-lg font-semibold text-white opacity-80 shadow-lg md:self-end"
      aria-busy="true"
      aria-label="Loading news button"
    >
      Check It Out
    </button>
  ),
});

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
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 text-center text-zinc-200 md:ml-20">
        <h1 className="font-heading animate-fade-in mb-6 hidden text-7xl font-bold tracking-wide md:block">
          Humor Hub!
        </h1>

        {/* Mic Finder Section */}
        <section
          aria-labelledby="micfinder-heading"
          className="mx-auto my-10 w-full grow rounded-2xl bg-stone-900/70 p-2 shadow-lg"
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
                  width={140}
                  height={140}
                  className="rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3"
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
          className="mx-auto my-10 w-full grow rounded-2xl bg-stone-900/70 p-2 shadow-lg"
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
                  width={140}
                  height={140}
                  sizes="140px"
                  className="rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3"
                  loading="lazy"
                />
              </NewsButton>
            </figure>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
