import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import ProtectedRouteButton from "./components/ProtectedRouteButton";
import RoundImage from "./components/RoundImage";
import SectionCard from "./components/SectionCard";

const HomepagePoll = dynamic(() => import("./components/HomepagePoll"));
const EventForm = dynamic(() => import("./components/EventForm"));

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
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

const IMAGE_PROPS = {
  interactive: true,
  width: 168,
  height: 168,
  sizes: "(min-width: 768px) 168px, 128px",
  quality: 70,
  className: "bg-white p-1",
} as const;

export default function Home() {
  return (
    <main className="grid min-h-dvh content-start gap-12 p-2 py-20 text-center md:ml-20">
      <div className="fixed top-21 left-2 z-1 lg:top-2 lg:left-22">
        <HomepagePoll />
      </div>

      <h1 className="text-5xl opacity-0 transition-opacity md:text-6xl md:opacity-100 lg:text-7xl">
        Humor Hub!
      </h1>

      <SectionCard id="micfinder-heading" title="Mic Finder!" variant="spaced">
        <div className="grid gap-6 md:grid-cols-2 md:text-left">
          <div>
            <h3 className="mb-1 text-lg md:text-xl">
              Looking for your next Mic?
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              MicFinder connects comics, musicians and poets with open mics
              worldwide!
              <br />
              Explore 1,000s of listings and get on stage!
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <Link href="/mic-finder">
              <RoundImage
                src="/favicon.ico"
                alt="Mic Finder - Find open mics near you"
                {...IMAGE_PROPS}
                priority
              />
            </Link>
          </figure>
          <EventForm />
          <Link href="/mic-finder" className="btn-primary w-72 md:w-80">
            Find Your Mic!
          </Link>
        </div>
      </SectionCard>

      <SectionCard id="news-heading" title="Hub News!">
        <ProtectedRouteButton
          route="/News"
          label="News"
          className="grid gap-6 md:mr-4 md:grid-cols-2 md:text-right"
        >
          <div className="md:col-start-2">
            <h3 className="mb-1 text-lg md:text-xl">
              Your Source for Fresh Headlines!
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Looking for something topical?
              <br />
              Check out the Hub News for the latest updates!
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <RoundImage
              src="/newsy.webp"
              alt="Hub News - Latest comedy headlines"
              {...IMAGE_PROPS}
            />
          </figure>
          <span className="btn-primary w-72 self-start justify-self-center text-lg md:w-80 md:justify-self-end md:self-auto">
            Check It Out
          </span>
        </ProtectedRouteButton>
      </SectionCard>

      <SectionCard id="profile-heading" title="Profile">
        <ProtectedRouteButton
          route="/Profile"
          label="Profile"
          className="grid gap-6 md:grid-cols-2 md:text-left"
        >
          <div>
            <h3 className="mb-1 text-lg md:text-xl">
              Keep your comedy calling card fresh.
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Update your avatar, and save mics for easy access on the road.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:row-span-2 md:justify-items-end">
            <RoundImage
              src="/profile.webp"
              alt="Profile page placeholder"
              {...IMAGE_PROPS}
            />
          </figure>
          <span className="btn-primary">Visit Your Profile</span>
        </ProtectedRouteButton>
      </SectionCard>

      <SectionCard id="contact-heading" title="Contact">
        <Link
          href="/contact"
          className="grid gap-6 md:mr-4 md:grid-cols-2 md:text-right"
        >
          <div>
            <h3 className="mb-1 text-lg md:text-xl">
              Questions, feedback, or collabs?
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Drop the Humor Hub team a note and we will get back to you.
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <RoundImage
              src="/contact.webp"
              alt="Contact page placeholder"
              {...IMAGE_PROPS}
            />
          </figure>
          <span className="btn-primary md:justify-self-end md:self-auto">
            Contact Us
          </span>
        </Link>
      </SectionCard>

      <SectionCard id="about-heading" title="About">
        <Link
          href="/about"
          className="grid gap-6 md:grid-cols-2 md:text-left"
          aria-label="About Humor Hub: mission, team, and tools"
        >
          <div>
            <h3 className="mb-1 text-lg md:text-xl">
              See what makes the Hub tick.
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Learn the mission, the tools, and the team behind the laughs.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <RoundImage
              src="/about.webp"
              alt="About page placeholder"
              {...IMAGE_PROPS}
            />
          </figure>
          <span className="primary-cta">About Humor Hub</span>
        </Link>
      </SectionCard>
    </main>
  );
}
