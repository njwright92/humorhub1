import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

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
    <main className="grid min-h-screen content-start gap-8 p-2 pt-20 text-center md:ml-20">
      <h1 className="font-heading hidden text-6xl font-bold tracking-wide md:block">
        Humor Hub!
      </h1>
      <section
        aria-labelledby="micfinder-heading"
        className="mx-auto mb-4 grid w-full gap-8 rounded-2xl p-2 shadow-lg"
      >
        <h2
          id="micfinder-heading"
          className="font-heading text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-4xl md:text-5xl"
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
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <Link href="/mic-finder" className="group">
              <Image
                src="/hh1.webp"
                alt="Mic Finder - Find open mics near you"
                className="h-32 w-32 rounded-full border-2 border-zinc-700 object-contain shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 md:h-42 md:w-42"
                width={100}
                height={100}
              />
            </Link>
          </figure>
          <EventForm />
          <Link
            href="/mic-finder"
            className="mb-2 w-70 justify-self-center rounded-2xl bg-amber-700 px-2 py-1 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:outline hover:outline-white md:w-80 md:justify-self-start"
          >
            Find Your Mic!
          </Link>
        </div>
      </section>
      <section
        aria-labelledby="news-heading"
        className="mx-auto grid w-full gap-8 rounded-2xl p-2 shadow-lg"
      >
        <h2
          id="news-heading"
          className="font-heading text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-4xl md:text-5xl"
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
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <NewsButton className="group border-0 bg-transparent shadow-lg">
              <Image
                src="/newsy.webp"
                alt="Hub News - Latest comedy headlines"
                className="mb-4 h-32 w-32 rounded-full border-2 border-zinc-700 object-contain shadow-lg group-hover:scale-105 group-hover:rotate-3 md:h-42 md:w-42"
                width={100}
                height={100}
                quality={65}
              />
            </NewsButton>
            <NewsButton />
          </figure>
        </div>
      </section>
    </main>
  );
}
