import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Humor Hub | Mission & Tools",
  description:
    "Humor Hub empowers comedians with real-time event listings and curated news.",
  alternates: { canonical: "/about" },
};

const FEATURES = [
  {
    emoji: "🎤",
    title: "Mic Finder",
    description:
      "Search 500+ cities for Comedy Mics, Music Jams, and Festivals.",
    detail:
      "Venue managers can list events in seconds. More stage time for everyone!",
    href: "/mic-finder",
    btn: "Find a Mic",
    cls: "text-amber-700 hover:border-amber-700/50",
  },
  {
    emoji: "📰",
    title: "Hub News",
    description: "Daily inspiration feed across Business, Tech, and Politics!",
    detail: "Perfect for writing topical jokes and finding current events.",
    href: "/News",
    btn: "Read News",
    cls: "text-blue-400 hover:border-blue-400/50",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="page-shell gap-12 text-center">
      <header className="grid gap-4">
        <h1 className="page-title">About Us</h1>
        <h2 className="text-xl lg:text-2xl">Built for Comics by Comics</h2>
        <p className="mx-auto max-w-2xl text-stone-400">
          Humor Hub is a fast, friendly hub to help comedians find their next
          gig and joke!
        </p>
      </header>

      <section className="animate-slide-in mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={`card-muted group grid gap-2 p-6 text-left transition-all hover:-translate-y-1 ${f.cls}`}
          >
            <span className="text-4xl" aria-hidden="true">
              {f.emoji}
            </span>
            <h3 className="text-2xl">{f.title}</h3>
            <p className="text-sm text-stone-300">{f.description}</p>
            <p className="text-xs text-stone-500">{f.detail}</p>
            <Link href={f.href} className="mt-4 font-bold hover:underline">
              {f.btn} →
            </Link>
          </article>
        ))}
      </section>

      <section className="section-divider grid gap-6 pt-10">
        <h2 className="text-2xl">Ready to hit the stage?</h2>
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
