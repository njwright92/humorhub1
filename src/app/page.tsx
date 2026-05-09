import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import ProtectedRouteButton from "./components/ProtectedRouteButton";
import RoundImage from "./components/RoundImage";
import SectionCard from "./components/SectionCard";

const HomepagePoll = dynamic(() => import("./components/HomepagePoll"));
const EventForm = dynamic(() => import("./components/EventForm"));

export const metadata: Metadata = {
  title: "Humor Hub - Open Mics & Comedy",
  description: "Find open mics, jokes, and community at Humor Hub.",
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
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="page-shell gap-12 py-20 text-center">
      <div className="fixed top-21 left-2 z-1 lg:top-2 lg:left-22">
        <HomepagePoll />
      </div>

      <h1 className="text-5xl md:text-7xl">Humor Hub!</h1>

      <SectionCard id="mics" title="Mic Finder!" variant="spaced">
        <div className="grid gap-6 md:grid-cols-2 md:text-left">
          <div>
            <h3 className="mb-1 text-xl">Looking for your next Mic?</h3>
            <p className="text-stone-400">
              MicFinder connects comics, musicians and poets with open mics
              worldwide!
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <Link href="/mic-finder">
              <RoundImage
                src="/favicon.ico"
                alt="Mic Finder"
                className="bg-white p-1"
                width={168}
                height={168}
                interactive
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

      <SectionCard id="news" title="Hub News!">
        <ProtectedRouteButton
          route="/News"
          label="News"
          className="grid gap-6 md:grid-cols-2 md:text-right"
        >
          <div className="md:col-start-2">
            <h3 className="mb-1 text-xl">Your Source for Fresh Headlines!</h3>
            <p className="text-stone-400">
              Looking for something topical? Check out the Hub News for the
              latest updates!
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <RoundImage
              src="/newsy.webp"
              alt="News"
              className="bg-white p-1"
              width={168}
              height={168}
              interactive
            />
          </figure>
          <span className="primary-cta-right">Check It Out</span>
        </ProtectedRouteButton>
      </SectionCard>

      <SectionCard id="profile" title="Profile">
        <ProtectedRouteButton
          route="/Profile"
          label="Profile"
          className="grid gap-6 md:grid-cols-2 md:text-left"
        >
          <div>
            <h3 className="mb-1 text-xl">Keep your calling card fresh.</h3>
            <p className="text-stone-400">
              Update your avatar and save mics for easy access on the road.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <RoundImage
              src="/profile.webp"
              alt="Profile"
              width={168}
              height={168}
              interactive
            />
          </figure>
          <span className="primary-cta-left">Visit Your Profile</span>
        </ProtectedRouteButton>
      </SectionCard>

      <SectionCard id="contact" title="Contact">
        <Link
          href="/contact"
          className="grid gap-6 md:grid-cols-2 md:text-right"
        >
          <div className="md:col-start-2">
            <h3 className="mb-1 text-xl">Questions or feedback?</h3>
            <p className="text-stone-400">
              Drop the Humor Hub team a note and we will get back to you.
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <RoundImage
              src="/contact.webp"
              alt="Contact"
              width={168}
              height={168}
              interactive
            />
          </figure>
          <span className="primary-cta-right">Contact Us</span>
        </Link>
      </SectionCard>

      <SectionCard id="about" title="About">
        <Link href="/about" className="grid gap-6 md:grid-cols-2 md:text-left">
          <div>
            <h3 className="mb-1 text-xl">See what makes the Hub tick.</h3>
            <p className="text-stone-400">
              Learn the mission, the tools, and the team behind the laughs.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <RoundImage
              src="/about.webp"
              alt="About"
              width={168}
              height={168}
              interactive
            />
          </figure>
          <span className="primary-cta-left">About Humor Hub</span>
        </Link>
      </SectionCard>
    </main>
  );
}
