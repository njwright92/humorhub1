import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Agreement | Humor Hub",
  description:
    "Read the terms and conditions of using Humor Hub. Understand your rights and responsibilities.",
  alternates: { canonical: "/user-agreement" },
};

type Section = {
  title: string;
  content: string;
  list?: readonly string[];
};

const SECTIONS: readonly Section[] = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using Humor Hub, you agree to these Terms of Use. If you do not agree, please discontinue use of the platform immediately.",
  },
  {
    title: "2. Open Source & License",
    content:
      "This project is provided under the MIT License. You are free to use, copy, and modify the software, provided that:",
    list: [
      "The software is free of charge.",
      'The software is provided "as is" without warranty.',
    ],
  },
  {
    title: "3. User Responsibilities",
    content:
      "You are responsible for the content you upload (events, profiles, images). You agree not to use the platform for unlawful, harmful, or abusive behavior. We reserve the right to remove content that violates these standards.",
  },
  {
    title: "4. Disclaimer & Liability",
    content:
      "Humor Hub is provided without warranties of any kind. The operators and contributors are not liable for any damages arising from the use or inability to use this platform.",
  },
];

export default function UserAgreementPage() {
  return (
    <main className="page-shell gap-8">
      <h1 className="page-title text-center">User Agreement</h1>

      <section className="panel-light">
        <p className="border-b border-zinc-300 pb-4 text-sm text-zinc-600">
          <strong>Last Updated:</strong> December 2025
        </p>

        {SECTIONS.map(({ title, content, list }) => (
          <article key={title} className="grid gap-2">
            <h2 className="text-xl">{title}</h2>
            <p>{content}</p>
            {list && (
              <ul className="grid list-inside list-disc gap-1 pl-4">
                {list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </article>
        ))}

        <article className="grid gap-2">
          <h2 className="text-xl">5. Contact</h2>
          <p>
            Questions?{" "}
            <Link
              href="/contact"
              className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
            >
              Contact Us
            </Link>
          </p>
        </article>

        <div className="flex justify-center border-t border-stone-300 pt-6">
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
