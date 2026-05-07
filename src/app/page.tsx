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

  alternates: {
    canonical: "/",
  },
};

// DRY: Centralize shared props and classes
const IMAGE_PROPS = {
  interactive: true,
  width: 168,
  height: 168,
  sizes: "(min-width: 768px) 168px, 128px",
  quality: 70,
  className: "bg-white p-1",
} as const;

// Local DRY Constants for the Section blocks
const SECTION_GRID_LEFT = "grid gap-6 md:grid-cols-2 md:text-left";
const SECTION_GRID_RIGHT = "grid gap-6 md:mr-4 md:grid-cols-2 md:text-right";
const H3_STYLE = "mb-1 text-lg md:text-xl";
const P_STYLE = "text-sm leading-relaxed md:text-base";

export default function Home() {
  return (
    <main className="page-shell gap-12 py-20 text-center">
      {/* Poll Position */}
      <div className="fixed top-21 left-2 z-1 lg:top-2 lg:left-22">
        <HomepagePoll />
      </div>

      {/* h1: Global CSS handles font/weight/shadow. Just handle size and transitions here. */}
      <h1 className="text-5xl transition-opacity md:text-6xl lg:text-7xl">
        Humor Hub!
      </h1>

      {/* SECTION 1: MIC FINDER */}
      <SectionCard id="micfinder-heading" title="Mic Finder!" variant="spaced">
        <div className={SECTION_GRID_LEFT}>
          <div>
            <h3 className={H3_STYLE}>Looking for your next Mic?</h3>
            <p className={P_STYLE}>
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
                alt="Mic Finder"
                {...IMAGE_PROPS}
                priority
              />
            </Link>
          </figure>
          <EventForm />
          <Link href="/mic-finder" className="primary-cta-left">
            Find Your Mic!
          </Link>
        </div>
      </SectionCard>

      {/* SECTION 2: HUB NEWS */}
      <SectionCard id="news-heading" title="Hub News!">
        <ProtectedRouteButton
          route="/News"
          label="News"
          className={SECTION_GRID_RIGHT}
        >
          <div className="md:col-start-2">
            <h3 className={H3_STYLE}>Your Source for Fresh Headlines!</h3>
            <p className={P_STYLE}>
              Looking for something topical? <br />
              Check out the Hub News for the latest updates!
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <RoundImage src="/newsy.webp" alt="Hub News" {...IMAGE_PROPS} />
          </figure>
          <span className="primary-cta-right">Check It Out</span>
        </ProtectedRouteButton>
      </SectionCard>

      {/* SECTION 3: PROFILE */}
      <SectionCard id="profile-heading" title="Profile">
        <ProtectedRouteButton
          route="/Profile"
          label="Profile"
          className={SECTION_GRID_LEFT}
        >
          <div>
            <h3 className={H3_STYLE}>Keep your comedy calling card fresh.</h3>
            <p className={P_STYLE}>
              Update your avatar, and save mics for easy access on the road.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:row-span-2 md:justify-items-end">
            <RoundImage src="/profile.webp" alt="Profile" {...IMAGE_PROPS} />
          </figure>
          <span className="primary-cta-left">Visit Your Profile</span>
        </ProtectedRouteButton>
      </SectionCard>

      {/* SECTION 4: CONTACT */}
      <SectionCard id="contact-heading" title="Contact">
        <Link href="/contact" className={SECTION_GRID_RIGHT}>
          <div>
            <h3 className={H3_STYLE}>Questions, feedback, or collabs?</h3>
            <p className={P_STYLE}>
              Drop the Humor Hub team a note and we will get back to you.
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <RoundImage src="/contact.webp" alt="Contact" {...IMAGE_PROPS} />
          </figure>
          <span className="primary-cta-right">Contact Us</span>
        </Link>
      </SectionCard>

      {/* SECTION 5: ABOUT */}
      <SectionCard id="about-heading" title="About">
        <Link
          href="/about"
          className={SECTION_GRID_LEFT}
          aria-label="About Humor Hub"
        >
          <div>
            <h3 className={H3_STYLE}>See what makes the Hub tick.</h3>
            <p className={P_STYLE}>
              Learn the mission, the tools, and the team behind the laughs.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <RoundImage src="/about.webp" alt="About" {...IMAGE_PROPS} />
          </figure>
          <span className="primary-cta-left">About Humor Hub</span>
        </Link>
      </SectionCard>
    </main>
  );
}
