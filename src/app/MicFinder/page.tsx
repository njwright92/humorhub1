import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { fetchMicFinderData } from "@/app/lib/data/events";
import MicFinderClient from "./MicFinderClient";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export const metadata: Metadata = {
  title:
    "MicFinder: 1,000's of Comedy, music, and all-arts Open Mics | The Humor Hub",
  description:
    "Discover the best comedy open mics near you. Search by city, view our interactive map, and join the community. The ultimate directory for stand-up comedians.",
  alternates: {
    canonical: "https://www.thehumorhub.com/MicFinder",
  },
  openGraph: {
    title: "MicFinder - Find Comedy Open Mics in the USA and Worldwide",
    description:
      "Search 1,000's of stand-up comedy, music, and all-arts open mics by city or date on our interactive map. Add your event and connect with the comedy community.",
    url: "https://www.thehumorhub.com/MicFinder",
    siteName: "Humor Hub",
    type: "website",
  },
};

function MicFinderSkeleton() {
  return (
    <div className="flex flex-col p-2 text-zinc-200 text-center md:ml-20 min-h-screen animate-pulse">
      <div className="h-16 bg-zinc-700 rounded-lg mb-6" />
      <div className="h-12 bg-zinc-700 rounded-lg w-3/4 mx-auto mb-4" />
      <div className="h-8 bg-zinc-700 rounded-lg w-1/2 mx-auto mb-8" />
      <div className="h-64 bg-zinc-700 rounded-lg mb-6" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
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
        }),
      }}
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
    <>
      <StructuredData />
      <Header />
      <main className="flex flex-col p-2 text-zinc-200 text-center md:ml-20 min-h-screen">
        <div className="flex flex-col items-center animate-fade-in">
          {/* Alert Banner */}
          <div
            role="alert"
            className="border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-lg text-center mb-3 bg-zinc-200 text-sm max-w-2xl mx-auto"
          >
            <p>
              <strong className="font-bold">📢 Note: </strong>
              Open mic events evolve quickly. See something outdated?{" "}
              <Link
                href="/contact"
                className="underline font-bold text-blue-700 hover:text-blue-900 transition-colors"
              >
                Contact Us
              </Link>{" "}
              keep the comedy community thriving!
            </p>
          </div>

          <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl rounded-lg text-4xl sm:text-5xl md:text-6xl lg:text-6xl mt-6 mb-4 font-heading">
            Mic Finder
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 font-bold drop-shadow-xl font-heading">
            Discover Mics and Festivals Near You!
          </h2>
          <p className="mt-2 mb-6 text-zinc-200 max-w-2xl mx-auto text-lg">
            Find a Mic tonight or list yours, built by comics for comics. Use
            Mic Finder to connect with your community!
          </p>
        </div>

        <Suspense fallback={<MicFinderSkeleton />}>
          <MicFinderContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
