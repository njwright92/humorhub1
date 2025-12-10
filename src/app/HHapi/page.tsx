import type { Metadata } from "next";
import NewsClient from "./NewsClient";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

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
  return (
    <>
      <Header />
      <main className="flex flex-col p-4 text-zinc-200 text-center md:ml-20 min-h-screen bg-transparent">
        <div className="flex flex-col items-center">
          <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl rounded-lg text-3xl sm:text-4xl md:text-4xl lg:text-5xl mt-10 mb-4 font-heading animate-fade-in">
            Hub News
          </h1>
          <p className="text-zinc-300 text-lg max-w-2xl mx-auto text-center mb-4">
            Curated stories from around the world. Stay informed with the latest
            updates.
          </p>
          <NewsClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
