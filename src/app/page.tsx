import type { Metadata } from "next";
import Link from "next/link";
import EventForm from "./components/EventForm";
import NewsButton from "./components/newsButton";
import RoundImage from "./components/RoundImage";
import SectionCard from "./components/SectionCard";

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
    <main className="home-main">
      <h1 className="home-hero-title">Humor Hub!</h1>
      <SectionCard id="micfinder-heading" title="Mic Finder!" variant="spaced">
        <div className="home-mic-grid">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Looking for your next Mic?
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              MicFinder connects comics, musicians and poets with open mics
              worldwide!
              <br />
              Explore 1,000s of listings and get on stage!
            </p>
          </div>
          <figure className="home-mic-figure">
            <Link href="/mic-finder">
              <RoundImage
                src="/hh1.webp"
                alt="Mic Finder - Find open mics near you"
                interactive
                width={168}
                height={168}
                sizes="(min-width: 768px) 168px, 128px"
                quality={70}
              />
            </Link>
          </figure>
          <EventForm />
          <Link href="/mic-finder" className="primary-cta">
            Find Your Mic!
          </Link>
        </div>
      </SectionCard>
      <SectionCard id="news-heading" title="Hub News!">
        <div className="home-news-grid">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Your Source for Fresh Headlines!
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Looking for something topical?
              <br />
              Check out the Hub News for the latest updates!
            </p>
          </div>
          <figure className="home-news-figure">
            <NewsButton className="border-0 bg-transparent">
              <RoundImage
                src="/newsy.webp"
                alt="Hub News - Latest comedy headlines"
                interactive
                variant="news"
                width={168}
                height={168}
                sizes="(min-width: 768px) 168px, 128px"
                quality={70}
              />
            </NewsButton>
            <NewsButton />
          </figure>
        </div>
      </SectionCard>
    </main>
  );
}
