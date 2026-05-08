import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Humor Hub",
  description:
    "Understand how Humor Hub collects and protects your information.",
  alternates: { canonical: "/privacy-policy" },
};

const SECTIONS = [
  {
    title: "1. Introduction",
    content:
      "At Humor Hub, we respect your privacy. This policy explains how we collect and protect your data when you find open mics or manage your profile.",
  },
  {
    title: "2. Information We Collect",
    content: "We collect information to provide a better experience:",
    list: [
      "Account Data: Email and name via Google.",
      "User Content: Events and bios.",
      "Usage Data: Analytics for map optimization.",
    ],
  },
  {
    title: "3. Third-Party Services",
    content:
      "Your data may be processed by Google Firebase, Google Maps API, and Vercel.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement security measures to protect your data. However, no method of internet transmission is 100% secure.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell gap-8">
      <h1 className="page-title text-center">Privacy Policy</h1>
      <section className="panel-light">
        <p className="border-b border-stone-300 pb-4 text-xs font-bold uppercase opacity-60">
          Last Updated: May 2026
        </p>

        <div className="grid gap-8 pt-4 text-left">
          {SECTIONS.map((s) => (
            <article key={s.title} className="grid gap-2">
              <h2 className="text-2xl text-amber-700">{s.title}</h2>
              <p>{s.content}</p>
              {s.list && (
                <ul className="grid list-inside list-disc gap-1 pl-4 opacity-80">
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}

          <article className="grid gap-2">
            <h2 className="text-2xl text-amber-700">5. Contact</h2>
            <p>
              Questions?{" "}
              <Link
                href="/contact"
                className="font-bold text-blue-700 underline"
              >
                Contact Us
              </Link>
            </p>
          </article>

          <div className="flex justify-center border-t border-stone-300 pt-8">
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
