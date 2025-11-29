import type { Metadata } from "next";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "Hub News - Latest Comedy & World Stories | Humor Hub",
  description:
    "Get the latest jokes, events, and comedy news along with top stories from around the world with Humor Hub.",
  openGraph: {
    title: "Hub News - Latest Comedy & World Stories",
    description: "Curated news and stories for the comedy community.",
    url: "https://www.thehumorhub.com/HHapi",
    siteName: "Humor Hub",
    type: "website",
  },
};

export default function NewsPage() {
  return <NewsClient />;
}
