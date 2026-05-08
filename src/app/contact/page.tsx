import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Humor Hub",
  description:
    "Have questions or feedback? Contact the Humor Hub team for support and inquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="page-shell gap-6 text-center">
      <header className="grid gap-2">
        <h1 className="page-title">Contact Us</h1>
        <p className="text-stone-300 md:text-lg">
          Questions or feedback? We&#39;re here to help.
        </p>
        <p className="text-xs text-stone-400">
          We typically respond within 1-2 business days.
        </p>
      </header>

      <ContactForm />

      <section className="section-divider grid gap-6 pt-10">
        <h2 className="text-2xl">Want to keep exploring?</h2>
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
