import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Agreement | Humor Hub",
  description: "Read the terms and conditions of using Humor Hub.",
  alternates: { canonical: "/user-agreement" },
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using Humor Hub, you agree to these Terms. If you do not agree, discontinue use immediately.",
  },
  {
    title: "2. License",
    content:
      "This project is provided under the MIT License. It is provided 'as is' without warranty.",
  },
  {
    title: "3. User Responsibilities",
    content:
      "You are responsible for content you upload. We reserve the right to remove harmful content.",
  },
  {
    title: "4. Liability",
    content:
      "Operators and contributors are not liable for any damages arising from the use of this platform.",
  },
];

export default function UserAgreementPage() {
  return (
    <main className="page-shell gap-8">
      <h1 className="page-title text-center">User Agreement</h1>
      <section className="panel-light">
        <p className="border-b border-stone-300 pb-4 text-xs font-bold uppercase opacity-60">
          Last Updated: December 2025
        </p>

        <div className="grid gap-8 pt-4 text-left">
          {SECTIONS.map((s) => (
            <article key={s.title} className="grid gap-2">
              <h2 className="text-2xl text-amber-700">{s.title}</h2>
              <p>{s.content}</p>
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
