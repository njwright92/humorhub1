import type { Metadata } from "next";
import NewsClient from "./NewsClient";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export const metadata: Metadata = {
  title: "Hub News - Latest Comedy & World Stories | Humor Hub",
  description:
    "Get the latest jokes, events, and comedy news along with top stories from around the world with Humor Hub.",
  alternates: {
    canonical: "https://www.thehumorhub.com/HHapi",
  },
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
      <main className="flex min-h-screen flex-col p-4 text-center text-zinc-200 md:ml-20">
        <header className="flex flex-col items-center">
          <h1 className="font-heading animate-fade-in mt-10 mb-4 text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-4xl lg:text-5xl">
            Hub News
          </h1>
          <p className="mb-4 max-w-2xl text-lg text-stone-300">
            Curated stories from around the world. Stay informed with the latest
            updates.
          </p>
        </header>

        <NewsClient />
      </main>
      <Footer />
    </>
  );
}
