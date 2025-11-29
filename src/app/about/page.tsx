import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("../components/header"));
const Footer = dynamic(() => import("../components/footer"));

export const metadata: Metadata = {
  title: "About Humor Hub | Mission & Tools",
  description:
    "Humor Hub empowers comedians with real-time event listings, and curated news to supercharge your career.",
  alternates: {
    canonical: "https://www.thehumorhub.com/about",
  },
  openGraph: {
    title: "About Humor Hub | Mission & Tools",
    description:
      "Discover how Humor Hub helps you find gigs, capture ideas, and stay inspired.",
    url: "https://www.thehumorhub.com/about",
    type: "website",
    images: [
      {
        url: "https://www.thehumorhub.com/images/og-image-about.jpg",
        width: 1200,
        height: 630,
        alt: "About Humor Hub",
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="screen-container content-with-sidebar bg-zinc-900 text-zinc-200">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Built for Comics, <br />
            <span className="text-orange-500">By Comics.</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Humor Hub was created to solve the two biggest problems every
            working comedian faces: finding the next gig and finding the next
            joke.
          </p>
        </section>

        {/* FEATURES GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Feature 1: Mic Finder */}
          <div className="card-style bg-zinc-800/50 border border-zinc-700 p-8 rounded-xl hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="mb-4 text-4xl">🎤</div>
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
              Mic Finder
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              The ultimate directory. Search 500+ cities for Comedy Mics, Music
              Jams, and Festivals. Filter by date, genre, or location.
            </p>
            <p className="text-zinc-500 text-sm">
              Venue managers can list events in seconds. The wider our database,
              the more stage time for everyone—whether you&lsquo;re testing 5
              minutes or headlining.
            </p>
            <div className="mt-6">
              <Link
                href="/MicFinder"
                className="text-blue-400 font-bold text-sm hover:text-white transition-colors"
              >
                Find a Mic →
              </Link>
            </div>
          </div>

          {/* Feature 2: Hub News */}
          <div className="card-style bg-zinc-800/50 border border-zinc-700 p-8 rounded-xl hover:border-orange-500/50 transition-all hover:-translate-y-1 group">
            <div className="mb-4 text-4xl">📰</div>
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
              Hub News
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Your daily inspiration feed. Curated headlines across Business,
              Entertainment, Tech, and Politics—updated every hour.
            </p>
            <p className="text-zinc-500 text-sm">
              Perfect for writing topical jokes, finding current-event
              callbacks, or discovering that unexpected angle for your next
              routine.
            </p>
            <div className="mt-6">
              <Link
                href="/HHapi"
                className="text-orange-400 font-bold text-sm hover:text-white transition-colors"
              >
                Read News →
              </Link>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="text-center max-w-2xl mx-auto border-t border-zinc-800 pt-12">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to hit the stage?
          </h3>
          <div className="flex justify-center gap-4">
            <Link
              href="/MicFinder"
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
            >
              Find Events
            </Link>
            <Link
              href="/"
              className="btn bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition"
            >
              Back Home
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
