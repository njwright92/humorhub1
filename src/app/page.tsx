import type { Metadata } from "next";
import Link from "next/link";
import EventForm from "./components/EventForm";
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
        <div className="home-news-grid">
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
          </figure>
          <div className="md:col-start-2 md:justify-self-end">
            <NewsButton />
          </div>
        </div>
      </SectionCard>
      <SectionCard id="profile-heading" title="Profile">
        <div className="home-mic-grid">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Keep your comedy calling card fresh.
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Update your bio, avatar, and favorites so other comics can find
              you.
            </p>
          </div>
          <figure className="home-mic-figure md:row-span-2">
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
        <div className="home-news-grid">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              Questions, feedback, or collabs?
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Drop the Humor Hub team a note and we will get back to you.
            </p>
          </div>
          <figure className="home-news-figure">
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
        <div className="home-mic-grid">
          <div>
            <h3 className="mb-1 text-lg md:col-start-2 md:text-xl">
              See what makes the Hub tick.
            </h3>
            <p className="text-sm leading-relaxed md:text-base">
              Learn the mission, the tools, and the team behind the laughs.
            </p>
          </div>
          <figure className="home-mic-figure">
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
