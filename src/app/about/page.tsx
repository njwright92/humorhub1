import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Humor Hub | Mission & Tools",
  description:
    "Humor Hub empowers comedians with real-time event listings and curated news to supercharge your career.",
  alternates: { canonical: "/about" },
};

const FEATURES = [
  {
    emoji: "🎤",
    title: "Mic Finder",
    description:
      "The ultimate directory. Search 500+ cities for Comedy Mics, Music Jams, and Festivals. Filter by date, genre, or location.",
    detail:
      "Venue managers can list events in seconds. The wider our database, the more stage time for everyone!",
    href: "/mic-finder",
    linkText: "Find a Mic",
    color: "amber",
  },
  {
    emoji: "📰",
    title: "Hub News",
    description:
      "Your daily inspiration feed. Curated headlines across Business, Entertainment, Tech, and Politics!",
    detail:
      "Perfect for writing topical jokes, finding current events, or discovering that unexpected angle of a story.",
    href: "/News",
    linkText: "Read News",
    color: "blue",
  },
] as const;

const colorStyles = {
  amber: {
    title: "text-amber-700 group-hover:text-amber-600",
    border: "hover:border-amber-600/50",
    shadow: "hover:shadow-amber-900/20",
    link: "text-amber-700 hover:text-amber-800",
  },
  blue: {
    title: "text-blue-400 group-hover:text-blue-500",
    border: "hover:border-blue-500/50",
    shadow: "hover:shadow-blue-900/20",
    link: "text-blue-400 hover:text-blue-300",
  },
} as const;

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

        {FEATURES.map(
          ({ emoji, title, description, detail, href, linkText, color }) => {
            const styles = colorStyles[color];
            return (
              <article
                key={title}
                className={`card-muted group grid gap-2 p-6 text-left transition-transform hover:-translate-y-1 ${styles.border} ${styles.shadow}`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {emoji}
                </span>

                <h3 className={`text-xl transition-colors ${styles.title}`}>
                  {title}
                </h3>

                <p className="text-sm text-stone-300">{description}</p>
                <p className="text-xs text-stone-400">{detail}</p>

                <Link
                  href={href}
                  className={`mt-2 inline-flex items-center gap-1 font-bold transition-colors group-hover:underline ${styles.link}`}
                >
                  {linkText}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          },
        )}
      </section>

      <section
        aria-labelledby="cta-heading"
        className="section-divider grid gap-6 pt-8"
      >
        <h3 id="cta-heading" className="text-xl md:text-2xl">
          Ready to hit the stage?
        </h3>

        <div className="cta-row">
          <Link href="/mic-finder" className="btn-primary">
            Find Events
          </Link>
          <Link href="/" className="btn-dark">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
