import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "About Humor Hub | Mission & Tools",
  description:
    "Humor Hub empowers comedians with real-time event listings and curated news to supercharge your career.",
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

// Feature card data
const FEATURES = [
  {
    emoji: "🎤",
    title: "Mic Finder",
    description:
      "The ultimate directory. Search 500+ cities for Comedy Mics, Music Jams, and Festivals. Filter by date, genre, or location.",
    detail:
      "Venue managers can list events in seconds. The wider our database, the more stage time for everyone—whether you're testing 5 minutes or headlining.",
    link: "/MicFinder",
    linkText: "Find a Mic",
    color: "blue",
  },
  {
    emoji: "📰",
    title: "Hub News",
    description:
      "Your daily inspiration feed. Curated headlines across Business, Entertainment, Tech, and Politics—updated every hour.",
    detail:
      "Perfect for writing topical jokes, finding current-event callbacks, or discovering that unexpected angle for your next routine.",
    link: "/HHapi",
    linkText: "Read News",
    color: "amber",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center p-4 text-center text-zinc-200 md:ml-24">
        {/* Hero */}
        <header className="animate-fade-in mx-auto mt-6 mb-8 max-w-4xl sm:mt-10 sm:mb-4">
          <h1 className="font-heading mb-2 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
            Built for Comics
          </h1>
          <p className="font-heading mb-6 text-lg font-bold tracking-wide text-amber-300 sm:mb-10 sm:text-xl md:text-2xl">
            By a Comic
          </p>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg md:text-xl">
            Humor Hub was created to solve the two biggest problems every
            working comedian faces: finding the next gig and finding the next
            joke.
          </p>
        </header>

        {/* Features */}
        <section
          aria-labelledby="features-heading"
          className="mx-auto mb-12 grid w-full max-w-5xl gap-4 px-2 sm:mb-16 sm:gap-8 md:grid-cols-2"
        >
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>

          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={`group rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 text-left backdrop-blur-sm transition-all hover:-translate-y-1 sm:p-6 md:p-8 hover:border-${feature.color}-500/50 hover:shadow-2xl hover:shadow-${feature.color}-900/20`}
            >
              <span
                className="mb-3 block text-3xl sm:mb-4 sm:text-4xl"
                aria-hidden="true"
              >
                {feature.emoji}
              </span>
              <h3
                className={`font-heading mb-2 text-xl font-bold transition-colors sm:mb-3 sm:text-2xl group-hover:text-${feature.color}-400`}
              >
                {feature.title}
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-zinc-300 sm:mb-4 sm:text-base">
                {feature.description}
              </p>
              <p className="text-xs text-zinc-400 sm:text-sm">
                {feature.detail}
              </p>
              <Link
                href={feature.link}
                className={`mt-4 inline-flex items-center gap-1 text-sm font-bold text-${feature.color}-400 transition-colors group-hover:underline hover:text-${feature.color}-300 sm:mt-6`}
              >
                {feature.linkText}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>

        {/* CTA */}
        <section
          aria-labelledby="cta-heading"
          className="mx-auto w-full max-w-2xl border-t border-zinc-800 pt-8 sm:pt-12"
        >
          <h2
            id="cta-heading"
            className="font-heading mb-6 text-xl font-bold sm:mb-8 sm:text-2xl"
          >
            Ready to hit the stage?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/MicFinder"
              className="rounded-lg bg-amber-300 px-6 py-2.5 font-bold text-zinc-950 shadow-lg transition-transform hover:scale-105 hover:bg-amber-400 sm:px-8 sm:py-3"
            >
              Find Events
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-zinc-700 px-6 py-2.5 font-bold text-zinc-100 shadow-lg transition-transform hover:scale-105 hover:bg-zinc-600 sm:px-8 sm:py-3"
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
