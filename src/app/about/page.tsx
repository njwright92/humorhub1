import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Humor Hub | Mission & Tools",
  description:
    "Humor Hub empowers comedians with real-time event listings and curated news to supercharge your career.",
  alternates: { canonical: "https://www.thehumorhub.com/about" },
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
      "Venue managers can list events in seconds. The wider our database, the more stage time for everyone!",
    link: "/mic-finder",
    linkText: "Find a Mic",
    titleBaseClass: "text-amber-700",
    titleHoverClass: "hover:text-amber-600",
    borderHoverClass: "hover:border-amber-600/50",
    shadowHoverClass: "hover:shadow-amber-900/20",
    linkTextClass: "text-amber-700 hover:text-amber-800",
  },
  {
    emoji: "📰",
    title: "Hub News",
    description:
      "Your daily inspiration feed. Curated headlines across Business, Entertainment, Tech, and Politics!",
    detail:
      "Perfect for writing topical jokes, finding current events, or discovering that unexpected angle of a story.",
    link: "/News",
    linkText: "Read News",
    titleBaseClass: "text-blue-400",
    titleHoverClass: "hover:text-blue-500",
    borderHoverClass: "hover:border-blue-500/50",
    shadowHoverClass: "hover:shadow-blue-900/20",
    linkTextClass: "text-blue-400 hover:text-blue-300",
  },
] as const;

const FEATURE_CARD_BASE =
  "card-muted group grid gap-2 p-6 text-left transition-transform hover:-translate-y-1";

const FEATURE_TITLE_BASE = "text-xl transition-colors";

const FEATURE_LINK_BASE =
  "mt-2 inline-flex items-center gap-1 font-bold transition-colors group-hover:underline";

export default function AboutPage() {
  return (
    <main className="page-shell gap-12 p-4 text-center">
      <header className="grid justify-items-center gap-6">
        <hgroup className="grid gap-2">
          <h1 className="page-title">About Us</h1>
          <h2 className="text-lg font-semibold lg:text-xl">
            Built for Comics by Comics
          </h2>
        </hgroup>
        <p className="text-sm leading-relaxed text-stone-300 lg:text-base">
          Humor Hub is a fast, friendly hub to help comedians find their next
          gig and joke!
        </p>
      </header>

      <section
        aria-labelledby="features-heading"
        className="animate-slide-in mx-auto grid max-w-5xl gap-6 md:grid-cols-2"
      >
        <h3 id="features-heading" className="sr-only">
          Features
        </h3>

        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className={`${FEATURE_CARD_BASE} ${feature.borderHoverClass} ${feature.shadowHoverClass}`}
          >
            <span className="text-3xl" aria-hidden="true">
              {feature.emoji}
            </span>

            <h3
              className={`${FEATURE_TITLE_BASE} ${feature.titleBaseClass} ${feature.titleHoverClass}`}
            >
              {feature.title}
            </h3>

            <p className="text-sm text-stone-300">{feature.description}</p>
            <p className="text-xs text-stone-400">{feature.detail}</p>

            <Link
              href={feature.link}
              className={`${FEATURE_LINK_BASE} ${feature.linkTextClass}`}
            >
              {feature.linkText}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>

      <section
        aria-labelledby="cta-heading"
        className="section-divider grid gap-6 pt-8"
      >
        <h3 id="cta-heading" className="text-xl md:text-2xl">
          Ready to hit the stage?
        </h3>

        <div className="cta-row">
          <Link href="/mic-finder" className="btn-amber hover:bg-amber-800">
            Find Events
          </Link>
          <Link
            href="/"
            className="rounded-2xl bg-stone-700 px-4 py-2 font-bold text-white shadow-xl transition-transform hover:scale-105 hover:bg-stone-800"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
