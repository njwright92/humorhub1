import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import MicFinderClient from "./MicFinderClient";
import EventForm from "@/app/components/EventForm";

export const metadata: Metadata = {
  title: "MicFinder: 1,000's of Comedy, Music & All-Arts Open Mics | Humor Hub",
  description:
    "Discover the best comedy open mics near you. Search by city, view our interactive map, and join the community. The ultimate directory for stand-up comedians.",
  alternates: {
    canonical: "/mic-finder",
  },
  openGraph: {
    title: "MicFinder - Find Comedy Open Mics in the USA and Worldwide",
    description:
      "Search 1,000's of stand-up comedy, music, and all-arts open mics by city or date on our interactive map. Add your event and connect with the comedy community.",
    url: "/mic-finder",
    siteName: "Humor Hub",
    type: "website",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Comedy Open Mics Directory",
  description:
    "Directory of recurring comedy open mics and festivals across the USA.",
  numberOfItems: 2,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Event",
        name: "Open Mic Night at Spokane Comedy Club",
        description: "Every Wednesday. Open Mic Comedy Free admission.",
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
  ],
} as const;

function MicFinderSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading MicFinder content"
      className="animate-pulse space-y-4 p-2 *:rounded-2xl *:bg-stone-700"
    >
      <div className="h-11" />
      <div className="h-12" />
      <div className="h-48" />
      <div className="h-48" />
      <div className="h-96" />
      <div className="h-96" />
    </div>
  );
}

export default function MicFinderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <main className="grid min-h-dvh justify-items-center gap-8 px-1 py-10 text-center md:ml-20 md:gap-10 md:px-4 md:py-16">
        <aside
          aria-label="Community notice"
          className="shadow-soft -mt-8 min-h-10 w-full max-w-4xl transform-gpu rounded-2xl border border-amber-800 bg-zinc-200 p-1 text-xs leading-tight font-medium text-amber-800 contain-content lg:text-base"
        >
          <span aria-hidden="true">📢 </span>
          Note: Open mic events evolve quickly. See something outdated?{" "}
          <Link
            href="/contact"
            className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
          >
            Contact Us
          </Link>{" "}
          to keep the comedy community thriving!
        </aside>

        <hgroup className="space-y-2">
          <h1 className="page-title">Mic Finder</h1>
          <p className="text-lg leading-tight font-semibold md:text-xl lg:text-2xl">
            Discover Mics and Festivals Near You!
          </p>
        </hgroup>

        <p className="max-w-2xl text-sm text-stone-300 md:text-base lg:text-lg">
          Use Mic Finder to connect with your community! Find a Mic or list
          yours!
        </p>

        <EventForm />

        <p className="text-sm font-semibold text-stone-300 italic md:text-base lg:text-lg">
          Pick a city and date!
        </p>

        <div className="page-content min-h-dvh">
          <Suspense fallback={<MicFinderSkeleton />}>
            <MicFinderClient />
          </Suspense>
        </div>
      </main>
    </>
  );
}
