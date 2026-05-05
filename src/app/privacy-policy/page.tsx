import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Humor Hub",
  description:
    "Understand how Humor Hub collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

type Section = {
  title: string;
  content: string;
  list?: readonly string[];
};

const SECTIONS: readonly Section[] = [
  {
    title: "1. Introduction",
    content:
      "At Humor Hub, we respect your privacy. This policy explains how we collect, use, and protect your information when you use our platform to find open mics, manage your comedian profile, or browse events.",
  },
  {
    title: "2. Information We Collect",
    content: "We collect information to provide a better experience:",
    list: [
      "Account Data: When you sign in via Google, we store your email, display name, and profile picture.",
      "User Content: Any events you submit, profile bios, or images you upload are stored in our database.",
      "Usage Data: We use analytics tools to understand how users interact with our maps and features.",
    ],
  },
  {
    title: "3. Third-Party Services",
    content:
      "We utilize trusted third-party services to operate our platform. Your data may be processed by:",
    list: [
      "Google Firebase: For authentication, database storage, and image hosting.",
      "Google Maps API: To display event locations and calculate distances.",
      "Vercel: For hosting our web infrastructure.",
    ],
  },
  {
    title: "4. Data Security",
    content:
      "We implement security measures to protect your data. However, no method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell gap-8">
      <h1 className="page-title text-center">Privacy Policy</h1>

      <section className="panel-light">
        <p className="border-b border-zinc-300 pb-4 text-sm text-zinc-600">
          <strong>Last Updated:</strong> May 2026
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
            If you have questions about this policy or wish to delete your data,
            please{" "}
            <Link
              href="/contact"
              className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
            >
              Contact Us.
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
