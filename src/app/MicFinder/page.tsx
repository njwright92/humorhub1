import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { fetchMicFinderData } from "@/app/lib/data/events";
import MicFinderClient from "./MicFinderClient";

interface Props {
  searchParams: Promise<{ city?: string }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { city } = await searchParams;

  const baseUrl = "https://www.thehumorhub.com/MicFinder";
  const canonical = city
    ? `${baseUrl}?city=${encodeURIComponent(city)}`
    : baseUrl;

  if (city) {
    return {
      title: `Open Mics in ${city} | Mic Finder | Humor Hub`,
      description: `Find comedy open mics in ${city}. Discover local stand-up comedy events, open mic nights, and festivals near you.`,
      alternates: { canonical },
      openGraph: {
        title: `Open Mics in ${city} | Humor Hub`,
        description: `Search stand-up comedy open mics in ${city}. Join the comedy community!`,
        url: canonical,
        siteName: "Humor Hub",
        type: "website",
      },
    };
  }

  return {
    title:
      "MicFinder: 1,000's of Comedy, Music & All-Arts Open Mics | Humor Hub",
    description:
      "Discover the best comedy open mics near you. Search by city, view our interactive map, and join the community. The ultimate directory for stand-up comedians.",
    alternates: { canonical },
    openGraph: {
      title: "MicFinder - Find Comedy Open Mics in the USA and Worldwide",
      description:
        "Search 1,000's of stand-up comedy, music, and all-arts open mics by city or date on our interactive map. Add your event and connect with the comedy community.",
      url: canonical,
      siteName: "Humor Hub",
      type: "website",
    },
  };
}

function MicFinderSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading MicFinder"
      className="flex min-h-screen animate-pulse flex-col p-2 text-center md:ml-20"
    >
      <div className="mb-6 h-16 rounded-2xl bg-zinc-700" />
      <div className="mx-auto mb-4 h-12 w-3/4 rounded-2xl bg-zinc-700" />
      <div className="mx-auto mb-8 h-8 w-1/2 rounded-2xl bg-zinc-700" />
      <div className="mb-6 h-64 rounded-2xl bg-zinc-700" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-zinc-700" />
        ))}
      </div>
      <span className="sr-only">Loading MicFinder content...</span>
    </div>
  );
}

function StructuredData() {
  const structuredData = {
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
          url: "https://www.thehumorhub.com/MicFinder?city=Spokane",
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
          url: "https://www.thehumorhub.com/MicFinder?city=New+York",
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
          url: "https://www.thehumorhub.com/MicFinder?city=Las+Vegas",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

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
    <main className="flex min-h-screen flex-col p-2 text-center md:ml-20">
      <StructuredData />
      <header className="animate-fade-in flex flex-col items-center">
        {/* Alert Banner */}
        <aside className="mx-auto mb-3 max-w-2xl rounded-2xl border border-red-700 bg-zinc-200 px-2 py-1.5 text-center text-xs text-red-700 shadow-lg sm:px-3 sm:py-2 sm:text-sm">
          <p>
            <span aria-hidden="true">📢 </span>Note: Open mic events evolve
            quickly. See something outdated?{" "}
            <Link
              href="/contact"
              className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
            >
              Contact Us
            </Link>{" "}
            to keep the comedy community thriving!
          </p>
        </aside>
        <h1 className="font-heading mt-4 mb-2 text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:mt-6 sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
          Mic Finder
        </h1>
        <p className="font-heading mb-3 text-lg font-bold text-shadow-sm sm:mb-4 sm:text-xl md:text-2xl lg:text-3xl">
          Discover Mics and Festivals Near You!
        </p>
        <p className="mx-auto mb-4 max-w-2xl text-sm text-stone-300 sm:mb-6 sm:text-base md:text-lg">
          Find a Mic tonight or list yours, built by comics for comics. Use Mic
          Finder to connect with your community!
        </p>
      </header>
      <Suspense fallback={<MicFinderSkeleton />}>
        <MicFinderContent />
      </Suspense>
    </main>
  );
}
