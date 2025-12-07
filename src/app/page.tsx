import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import micFinder from "../app/micFinder.webp";
import news from "../app/news.webp";
import Header from "./components/header";
import Footer from "./components/footer";
import EventForm from "./components/EventForm";
import NewsButton from "./components/newsButton";

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
      <div className="screen-container content-with-sidebar">
        <h1 className="hidden md:block text-zinc-200 text-7xl font-bold mb-6 tracking-wide">
          Humor Hub!
        </h1>

        {/* Mic Finder Section */}
        <section className="card-style mx-auto w-full">
          <h2 className="title mb-8 text-center sm:mb-10">Mic Finder!</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg">
                Looking for your next Mic?
                <br />
                <span className="font-bold">MicFinder</span> helps comedians
                find and share Mics worldwide!
                <br />
                <span className="mt-2 block">
                  With 1000s of open mic listings, find your next Mic now!
                </span>
              </p>
              <EventForm />
              <Link
                href="/MicFinder"
                className="btn w-80 text-center self-center"
              >
                Find Your Mic!
              </Link>
            </div>
            <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
              <Link href="/MicFinder" className="relative group">
                <Image
                  src={micFinder}
                  alt="Mic Finder Logo"
                  width={140}
                  height={140}
                  className="rounded-full shadow-lg border-2 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 object-contain"
                  priority
                  fetchPriority="high"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Hub News Section */}
        <section className="card-style mx-auto w-full animate-pulse-once">
          <h2 className="title mb-8 text-center sm:mb-10">Hub News!</h2>
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 w-full">
            <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right space-y-6">
              <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg">
                Your Source for{" "}
                <span className="font-bold">Fresh Headlines!</span>
                <br />
                Looking for something topical?
                <br />
                <span className="mt-2 block">
                  Check out the Hub News for the latest updates!
                </span>
              </p>
              <NewsButton />
            </div>
            <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
              <NewsButton className="relative group cursor-pointer bg-transparent p-0 border-0">
                <Image
                  src={news}
                  alt="Comedy News Update"
                  width={140}
                  height={140}
                  sizes="140px"
                  className="rounded-full shadow-2xl border-2 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 object-contain"
                  loading="lazy"
                />
              </NewsButton>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
