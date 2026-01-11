import type { Metadata } from "next";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "Hub News - Latest Comedy & World Stories | Humor Hub",
  description:
    "Get the latest jokes, events, and comedy news along with top stories from around the world with Humor Hub.",
  alternates: {
    canonical: "https://www.thehumorhub.com/News",
  },
  openGraph: {
    title: "Hub News - Latest Comedy & World Stories",
    description: "Curated news and stories for the comedy community.",
    url: "https://www.thehumorhub.com/News",
    siteName: "Humor Hub",
    type: "website",
  },
};

export default function NewsPage() {
  return (
    <main className="grid min-h-dvh content-start gap-4 p-2 pt-12 text-center md:ml-20">
      <h1 className="page-title">Hub News</h1>
      <p className="text-sm text-stone-300 md:text-lg">
        Curated stories from around the world. Stay informed with the latest
        updates.
      </p>
      <NewsClient />
    </main>
  );
}
