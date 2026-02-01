import type { Metadata } from "next";
import Link from "next/link";
import EventForm from "./components/EventForm";
import HomepagePoll from "./components/HomepagePoll";
import NewsButton from "./components/newsButton";
import ProfileButton from "./components/ProfileButton";
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
    <main className="grid min-h-dvh content-start gap-12 p-2 py-20 text-center md:ml-20">
      <div className="pointer-events-none fixed bottom-2 left-4 z-10 lg:top-2 lg:left-22">
        <HomepagePoll />
      </div>
      <h1 className="hidden text-5xl md:block md:text-6xl lg:text-7xl">
        Humor Hub!
      </h1>
      <SectionCard id="micfinder-heading" title="Mic Finder!" variant="spaced">
        <div className="grid gap-6 md:grid-cols-2 md:text-left">
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
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <Link href="/mic-finder">
              <RoundImage
                src="/favicon.ico"
                alt="Mic Finder - Find open mics near you"
                interactive
                width={168}
                height={168}
                sizes="(min-width: 768px) 168px, 128px"
                quality={70}
                priority
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
        <div className="grid gap-6 md:mr-4 md:grid-cols-2 md:text-right">
          <div className="md:col-start-2">
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Your Source for Fresh Headlines!
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Looking for something topical?
              <br />
              Check out the Hub News for the latest updates!
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
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
          </figure>
          <div className="md:col-start-2 md:justify-self-end">
            <NewsButton />
          </div>
        </div>
      </SectionCard>
      <SectionCard id="profile-heading" title="Profile">
        <div className="grid gap-6 md:grid-cols-2 md:text-left">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Keep your comedy calling card fresh.
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Update your bio, avatar, and favorites so other comics can find
              you.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:row-span-2 md:justify-items-end">
            <ProfileButton className="contents">
              <RoundImage
                src="/profile.webp"
                alt="Profile page placeholder"
                interactive
                width={168}
                height={168}
                sizes="(min-width: 768px) 168px, 128px"
                quality={70}
              />
            </ProfileButton>
          </figure>
          <ProfileButton className="primary-cta md:self-start">
            Visit Your Profile
          </ProfileButton>
        </div>
      </SectionCard>
      <SectionCard id="contact-heading" title="Contact">
        <div className="grid gap-6 md:mr-4 md:grid-cols-2 md:text-right">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Questions, feedback, or collabs?
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Drop the Humor Hub team a note and we will get back to you.
            </p>
          </div>
          <figure className="row-span-2 mb-4 grid place-items-center md:col-start-1 md:row-start-1 md:justify-items-start">
            <Link href="/contact">
              <RoundImage
                src="/contact.webp"
                alt="Contact page placeholder"
                interactive
                width={168}
                height={168}
                sizes="(min-width: 768px) 168px, 128px"
                quality={70}
              />
            </Link>
          </figure>
          <Link
            href="/contact"
            className="primary-cta md:self-start md:justify-self-end"
          >
            Contact Us
          </Link>
        </div>
      </SectionCard>
      <SectionCard id="about-heading" title="About">
        <div className="grid gap-6 md:grid-cols-2 md:text-left">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              See what makes the Hub tick.
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Learn the mission, the tools, and the team behind the laughs.
            </p>
          </div>
          <figure className="row-span-3 grid place-items-center md:justify-items-end">
            <Link
              href="/about"
              aria-label="About Humor Hub: mission, team, and tools"
            >
              <RoundImage
                src="/about.webp"
                alt="About page placeholder"
                interactive
                width={168}
                height={168}
                sizes="(min-width: 768px) 168px, 128px"
                quality={70}
              />
            </Link>
          </figure>
          <Link href="/about" className="primary-cta">
            About Humor Hub
          </Link>
        </div>
      </SectionCard>
    </main>
  );
}
