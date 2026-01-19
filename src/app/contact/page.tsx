import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Humor Hub",
  description:
    "Have questions or feedback? Contact the Humor Hub team for support and inquiries.",
  alternates: {
    canonical: "https://www.thehumorhub.com/contact",
  },
  openGraph: {
    title: "Contact Us | Humor Hub",
    description: "Contact Humor Hub for inquiries, feedback, or support.",
    url: "https://www.thehumorhub.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="page-shell gap-6 text-center">
      <header className="grid gap-2">
        <h1 className="page-title">Contact Us</h1>
        <p className="text-sm text-stone-300 md:text-base">
          Questions, feedback, or support? We&#39;re here to help.
        </p>
        <p className="text-xs text-stone-400 md:text-sm">
          We typically respond within 1-2 business days.
        </p>
      </header>
      <ContactForm />
      <section
        aria-labelledby="contact-cta-heading"
        className="section-divider grid gap-4 pt-6"
      >
        <h2 id="contact-cta-heading" className="text-lg md:text-xl">
          Want to keep exploring?
        </h2>
        <div className="cta-row">
          <Link href="/mic-finder" className="btn-amber hover:bg-amber-600">
            Find Events
          </Link>
          <Link
            href="/"
            className="rounded-2xl bg-stone-700 px-4 py-2 font-bold text-white shadow-xl transition-transform hover:scale-105 hover:bg-stone-600"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
