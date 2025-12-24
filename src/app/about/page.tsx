import type { Metadata } from "next";
import Link from "next/link";

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
    titleBaseClass: "text-amber-700",
    titleHoverClass: "group-hover:text-amber-600",
    borderHoverClass: "hover:border-amber-600/50",
    shadowHoverClass: "hover:shadow-amber-900/20",
    linkTextClass: "text-amber-700 hover:text-amber-600",
  },
  {
    emoji: "📰",
    title: "Hub News",
    description:
      "Your daily inspiration feed. Curated headlines across Business, Entertainment, Tech, and Politics—updated every hour.",
    detail:
      "Perfect for writing topical jokes, finding current-event callbacks, or discovering that unexpected angle for your next routine.",
    link: "/News",
    linkText: "Read News",
    titleBaseClass: "text-blue-400",
    titleHoverClass: "group-hover:text-blue-500",
    borderHoverClass: "hover:border-blue-500/50",
    shadowHoverClass: "hover:shadow-blue-900/20",
    linkTextClass: "text-blue-400 hover:text-blue-300",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 text-center md:ml-20">
      <h1 className="font-heading mt-10 mb-2 text-2xl font-bold text-amber-700 sm:text-4xl lg:text-5xl">
        Built for Comics
      </h1>
      <p className="font-heading mb-6 text-lg font-bold tracking-wide md:text-xl">
        By a Comic
      </p>
      <p className="mx-auto mb-12 max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">
        Humor Hub was created to solve the two biggest problems every working
        comedian faces: finding the next gig and finding the next joke.
      </p>

      <section
        aria-labelledby="features-heading"
        className="animate-slide-in mx-auto mb-12 grid w-full max-w-5xl gap-6 md:grid-cols-2"
      >
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>

        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className={`group rounded-2xl border border-stone-700 bg-stone-800/50 p-6 text-left transition-all hover:-translate-y-1 ${feature.borderHoverClass} ${feature.shadowHoverClass}`}
          >
            <span className="mb-3 block text-3xl" aria-hidden="true">
              {feature.emoji}
            </span>
            <h3
              className={`font-heading mb-2 text-xl font-bold transition-colors ${feature.titleBaseClass} ${feature.titleHoverClass}`}
            >
              {feature.title}
            </h3>
            <p className="mb-3 text-sm text-stone-300">{feature.description}</p>
            <p className="text-xs text-stone-400">{feature.detail}</p>
            <Link
              href={feature.link}
              className={`mt-4 inline-flex items-center gap-1 font-bold transition-colors group-hover:underline ${feature.linkTextClass}`}
            >
              {feature.linkText}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>

      <section
        aria-labelledby="cta-heading"
        className="border-t border-stone-800 pt-8"
      >
        <h2
          id="cta-heading"
          className="font-heading mb-6 text-xl font-bold sm:text-2xl"
        >
          Ready to hit the stage?
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/MicFinder"
            className="rounded-2xl bg-amber-700 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-amber-600"
          >
            Find Events
          </Link>
          <Link
            href="/"
            className="rounded-2xl bg-stone-700 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-stone-600"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
