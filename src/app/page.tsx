import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import micFinder from "../app/micFinder.webp";
import news from "../app/news1.webp";
import Header from "./components/header";
import Footer from "./components/footer";
import dynamic from "next/dynamic";

const EventForm = dynamic(() => import("./components/EventForm"), {
  loading: () => (
    <button className="bg-green-600 text-zinc-950 px-2 py-1 rounded-lg shadow-lg font-bold text-lg tracking-wide opacity-80 cursor-wait">
      Add Your Event
    </button>
  ),
});

const NewsButton = dynamic(() => import("./components/newsButton"), {
  loading: () => (
    <button className="bg-amber-300 text-white px-2 py-1 rounded-lg shadow-lg font-semibold text-lg w-80 text-center self-center md:self-end opacity-80 cursor-wait">
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
      {/* Changed div to main for semantics */}
      <main className="flex flex-col p-4 text-zinc-200 text-center md:ml-20 min-h-screen">
        <h1 className="hidden md:block text-zinc-200 text-7xl font-bold mb-6 tracking-wide font-heading animate-fade-in">
          Humor Hub!
        </h1>

        {/* Mic Finder Section */}
        <section className="grow bg-transparent text-zinc-200 p-2 mt-10 mb-10 shadow-lg rounded-lg mx-auto w-full">
          <h2 className="text-amber-300 font-bold tracking-wide drop-shadow-xl rounded-lg text-4xl sm:text-5xl md:text-6xl lg:text-6xl mt-10 mb-8 text-center sm:mb-10 font-heading">
            Mic Finder!
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg font-sans">
                Looking for your next Mic?
                <br />
                <span className="font-bold text-amber-300">MicFinder</span>{" "}
                connects comics and all artists with open mics worldwide!
                Explore 1,000s of listings and get on stage!
              </p>

              <EventForm />

              <Link
                href="/MicFinder"
                className="bg-amber-300 text-white px-2 py-1 rounded-lg shadow-lg font-semibold text-lg transform transition-transform hover:scale-105 hover:outline hover:outline-white w-80 text-center self-center"
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
        <section className="grow bg-transparent text-zinc-200 p-2 mt-10 mb-10 shadow-lg rounded-lg mx-auto w-full">
          <h2 className="text-amber-300 font-bold tracking-wide drop-shadow-xl rounded-lg text-4xl sm:text-5xl md:text-6xl lg:text-6xl mt-10 mb-8 text-center sm:mb-10 font-heading">
            Hub News!
          </h2>
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 w-full">
            <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right space-y-6">
              <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg font-sans">
                Your Source for{" "}
                <span className="font-bold text-amber-300">
                  Fresh Headlines!
                </span>
                <br />
                Looking for something topical?
                <br />
                <span className="mt-2 block">
                  Check out the Hub News for the latest updates!
                </span>
              </p>
              {/* Default button style */}
              <NewsButton />
            </div>
            <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
              {/* Image button style */}
              <NewsButton className="relative group cursor-pointer bg-transparent p-0 border-0 outline-none">
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
      </main>
      <Footer />
    </>
  );
}
