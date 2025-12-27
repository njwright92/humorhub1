import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import micFinder from "../app/hh1.webp";
import news from "../app/newsy.webp";

const EventForm = dynamic(() => import("./components/EventForm"));
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
      <h1 className="font-heading mt-18 mb-6 hidden text-6xl font-bold tracking-wide md:block">
        Humor Hub!
      </h1>
      <section
        aria-labelledby="micfinder-heading"
        className="mx-auto my-8 w-full grow rounded-2xl p-2 shadow-lg"
      >
        <h2
          id="micfinder-heading"
          className="font-heading mt-10 mb-8 text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:mb-10 sm:text-4xl md:text-5xl"
        >
          Mic Finder!
        </h2>
        <div className="grid gap-6 text-center md:grid-cols-2 md:text-left">
          <p className="leading-relaxed md:text-lg">
            Looking for your next Mic?
            <br />
            MicFinder connects comics and all artists with open mics worldwide!
            Explore 1,000s of listings and get on stage!
          </p>

          <figure className="row-span-3 flex items-center justify-center md:justify-end">
            <Link href="/mic-finder" className="group">
              <Image
                src={micFinder}
                alt="Mic Finder - Find open mics near you"
                className="h-32 w-32 rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 md:h-42 md:w-42"
                width={100}
                height={100}
                loading="lazy"
              />
            </Link>
          </figure>
          <div className="items-center">
            <EventForm />
          </div>
          <Link
            href="/mic-finder"
            className="w-70 justify-self-center rounded-2xl bg-amber-700 px-2 py-1 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:outline hover:outline-white md:w-80 md:justify-self-start"
          >
            Find Your Mic!
          </Link>
        </div>
      </section>
      <section
        aria-labelledby="news-heading"
        className="mx-auto my-8 w-full grow rounded-2xl p-2 shadow-lg"
      >
        <h2
          id="news-heading"
          className="font-heading mt-10 mb-8 text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:mb-10 sm:text-4xl md:text-5xl"
        >
          Hub News!
        </h2>
        <div className="grid gap-6 text-center md:grid-cols-2 md:text-right">
          <p className="leading-relaxed md:col-start-2 md:text-lg">
            Your Source for Fresh Headlines!
            <br />
            Looking for something topical? Check out the Hub News for the latest
            updates!
          </p>
          <figure className="row-span-2 flex items-center justify-center md:col-start-1 md:row-start-1 md:justify-start">
            <NewsButton className="group border-0 bg-transparent p-0">
              <Image
                src={news}
                alt="Hub News - Latest comedy headlines"
                className="h-32 w-32 rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 md:h-42 md:w-42"
                width={100}
                height={100}
                quality={65}
              />
            </NewsButton>
          </figure>
          <div className="md:col-start-2">
            <NewsButton />
          </div>
        </div>
      </section>
    </main>
  );
}
