import type { Metadata } from "next";
import MicFinderClient from "./MicFinderClient";

export const metadata: Metadata = {
  title:
    "MicFinder: 1,000's of Comedy, music, and all-arts Open Mics & Festivals | The Humor Hub",
  description:
    "Discover the best comedy open mics near you. Search by city, view our interactive map, and join the community. The ultimate directory for stand-up comedians.",
  alternates: {
    canonical: "https://www.thehumorhub.com/MicFinder",
  },
  openGraph: {
    title: "MicFinder - Find Comedy Open Mics Worldwide",
    description:
      "Search 1,000's of stand-up comedy, music, and all-arts open mics by city or date on our interactive map. Add your event and connect with the comedy community.",
    url: "https://www.thehumorhub.com/MicFinder",
    siteName: "Humor Hub",
    type: "website",
  },
};

export default function MicFinderPage() {
  return (
    <>
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
      <MicFinderClient />
    </>
  );
}
