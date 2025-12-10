import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";

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
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center p-4 text-zinc-100 text-center md:ml-24 min-h-screen">
        {/* HERO SECTION */}
        <section className="text-center mx-auto mb-4 mt-10 max-w-4xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-200 mb-4 tracking-tight font-heading">
            Built for Comics
          </h1>
          <p className="text-amber-300 text-xl md:text-2xl mb-10 font-heading font-bold tracking-wide">
            By a Comic
          </p>

          <p className="text-xl text-zinc-300 leading-relaxed font-sans max-w-2xl mx-auto">
            Humor Hub was created to solve the two biggest problems every
            working comedian faces: finding the next gig and finding the next
            joke.
          </p>
        </section>

        {/* FEATURES GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 w-full px-2">
          {/* Feature 1: Mic Finder */}
          <div className="bg-zinc-800/50 border border-zinc-700 p-8 rounded-xl hover:border-blue-500/50 transition-all hover:-translate-y-1 group hover:shadow-2xl hover:shadow-blue-900/20 backdrop-blur-sm text-left">
            <div className="mb-4 text-4xl">🎤</div>
            <h2 className="text-2xl font-bold text-zinc-200 mb-3 group-hover:text-blue-400 transition-colors font-heading">
              Mic Finder
            </h2>
            <p className="text-zinc-300 mb-4 leading-relaxed font-sans">
              The ultimate directory. Search 500+ cities for Comedy Mics, Music
              Jams, and Festivals. Filter by date, genre, or location.
            </p>
            <p className="text-zinc-400 text-sm font-sans">
              Venue managers can list events in seconds. The wider our database,
              the more stage time for everyone—whether you&lsquo;re testing 5
              minutes or headlining.
            </p>
            <div className="mt-6">
              <Link
                href="/MicFinder"
                className="text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors inline-flex items-center gap-1 group-hover:underline"
              >
                Find a Mic <span>→</span>
              </Link>
            </div>
          </div>

          {/* Feature 2: Hub News */}
          <div className="bg-zinc-800/50 border border-zinc-700 p-8 rounded-xl hover:border-amber-500/50 transition-all hover:-translate-y-1 group hover:shadow-2xl hover:shadow-amber-900/20 backdrop-blur-sm text-left">
            <div className="mb-4 text-4xl">📰</div>
            <h2 className="text-2xl font-bold text-zinc-200 mb-3 group-hover:text-amber-300 transition-colors font-heading">
              Hub News
            </h2>
            <p className="text-zinc-300 mb-4 leading-relaxed font-sans">
              Your daily inspiration feed. Curated headlines across Business,
              Entertainment, Tech, and Politics—updated every hour.
            </p>
            <p className="text-zinc-400 text-sm font-sans">
              Perfect for writing topical jokes, finding current-event
              callbacks, or discovering that unexpected angle for your next
              routine.
            </p>
            <div className="mt-6">
              <Link
                href="/HHapi"
                className="text-amber-300 font-bold text-sm hover:text-amber-200 transition-colors inline-flex items-center gap-1 group-hover:underline"
              >
                Read News <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="text-center max-w-2xl mx-auto border-t border-zinc-800 pt-12 w-full">
          <h3 className="text-2xl font-bold text-zinc-200 mb-8 font-heading">
            Ready to hit the stage?
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/MicFinder"
              className="bg-amber-300 hover:bg-amber-400 text-zinc-950 px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
            >
              Find Events
            </Link>
            <Link
              href="/"
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
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
