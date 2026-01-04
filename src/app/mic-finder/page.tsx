import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { fetchMicFinderData } from "@/app/lib/data/events";
import MicFinderClient from "./MicFinderClient";
import EventForm from "../components/EventForm";

export const metadata: Metadata = {
  title: "MicFinder: 1,000's of Comedy, Music & All-Arts Open Mics | Humor Hub",
  description:
    "Discover the best comedy open mics near you. Search by city, view our interactive map, and join the community. The ultimate directory for stand-up comedians.",
  alternates: {
    canonical: "https://www.thehumorhub.com/mic-finder",
  },
  openGraph: {
    title: "MicFinder - Find Comedy Open Mics in the USA and Worldwide",
    description:
      "Search 1,000's of stand-up comedy, music, and all-arts open mics by city or date on our interactive map. Add your event and connect with the comedy community.",
    url: "https://www.thehumorhub.com/mic-finder",
    siteName: "Humor Hub",
    type: "website",
  },
};

const SKELETON_ITEMS = [1, 2, 3, 4, 5] as const;

function MicFinderSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading MicFinder"
      className="animate-pulse p-2"
    >
      <div className="mb-6 h-16 rounded-2xl bg-stone-700" />
      <div className="mb-6 h-64 rounded-2xl bg-stone-700" />
      <div className="space-y-4">
        {SKELETON_ITEMS.map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-stone-700" />
        ))}
      </div>
      <span className="sr-only">Loading MicFinder content...</span>
    </div>
  );
}

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Comedy Open Mics Directory",
  description:
    "Directory of recurring comedy open mics and festivals across the USA.",
  numberOfItems: 3,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Event",
        name: "Open Mic Night at Spokane Comedy Club",
        description:
          "Every Wednesday. A night with professional and first-time comedians. Free admission.",
        startDate: "2025-12-03T19:30:00-08:00",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: "Spokane Comedy Club",
          address: {
            "@type": "PostalAddress",
            streetAddress: "315 W Sprague Ave",
            addressLocality: "Spokane",
            addressRegion: "WA",
            addressCountry: "US",
          },
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        performer: {
          "@type": "PerformingGroup",
          name: "Local Comedians",
        },
        url: "https://www.thehumorhub.com/mic-finder?city=Spokane",
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Event",
        name: "New York Comedy Club Open Mics",
        description:
          "Weekly stand-up open mic. $5 cover, 5 min sets. In-person signup.",
        startDate: "2025-12-02T16:00:00-05:00",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: "New York Comedy Club",
          address: {
            "@type": "PostalAddress",
            streetAddress: "85 E 4th St",
            addressLocality: "New York",
            addressRegion: "NY",
            addressCountry: "US",
          },
        },
        offers: {
          "@type": "Offer",
          price: "5.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        url: "https://www.thehumorhub.com/mic-finder?city=New+York",
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Event",
        name: "Open Mic Lunch at Jimmy Kimmel's Comedy Club",
        description:
          "Open Mic Lunch with Hailey Brooks. Doors 11 AM, Show 12 PM.",
        startDate: "2025-12-11T12:00:00-08:00",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: "Jimmy Kimmel's Comedy Club",
          address: {
            "@type": "PostalAddress",
            streetAddress: "3535 S Las Vegas Blvd",
            addressLocality: "Las Vegas",
            addressRegion: "NV",
            addressCountry: "US",
          },
        },
        url: "https://www.thehumorhub.com/mic-finder?city=Las+Vegas",
      },
    },
  ],
} as const;

const STRUCTURED_DATA_STRING = JSON.stringify(STRUCTURED_DATA);

async function MicFinderContent() {
  const { events, cities, cityCoordinates } = await fetchMicFinderData();

  return (
    <MicFinderClient
      initialEvents={events}
      initialCityCoordinates={cityCoordinates}
      initialCities={cities}
    />
  );
}

export default function MicFinderPage() {
  return (
    <main className="grid min-h-dvh justify-items-center gap-4 p-2 text-center md:ml-20 md:gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_STRING }}
      />

      <aside className="rounded-2xl border border-red-800 bg-zinc-200 p-2 text-xs font-medium text-red-800 shadow-lg lg:text-base">
        <p>
          <span aria-hidden="true">📢 </span>
          Note: Open mic events evolve quickly. See something outdated?{" "}
          <Link
            href="/contact"
            className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
          >
            Contact Us
          </Link>{" "}
          to keep the comedy community thriving!
        </p>
      </aside>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-wide text-amber-700 text-shadow-md md:text-4xl lg:text-5xl">
          Mic Finder
        </h1>
        <p className="text-lg font-bold text-shadow-md sm:text-xl md:text-2xl lg:text-3xl">
          Discover Mics and Festivals Near You!
        </p>
      </header>

      <p className="text-sm text-stone-300 md:text-base lg:text-lg">
        Find a Mic tonight or list yours, built by comics for comics. Use Mic
        Finder to connect with your community!
      </p>

      <EventForm />

      <p className="mb-2 text-sm font-semibold text-stone-400 md:text-base">
        Find your next show or night out. Pick a city and date!
      </p>

      <Suspense fallback={<MicFinderSkeleton />}>
        <MicFinderContent />
      </Suspense>
    </main>
  );
}
