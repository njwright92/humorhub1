import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Humor Hub",
  description:
    "Understand how Humor Hub collects, uses, and protects your personal information.",
  alternates: {
    canonical: "https://www.thehumorhub.com/privacyPolicy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center md:ml-24">
        <h1 className="font-heading mb-8 text-4xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-5xl md:text-6xl">
          Privacy Policy
        </h1>

        <section className="mx-auto max-w-4xl rounded-2xl border border-zinc-300 bg-zinc-200 p-8 text-left text-zinc-800 shadow-lg">
          <p className="mb-6 border-b border-zinc-300 pb-4 text-sm text-zinc-600">
            <strong>Last Updated:</strong> November 2025
          </p>

          <div className="space-y-8">
            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-stone-900">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                At Humor Hub, we respect your privacy. This policy explains how
                we collect, use, and protect your information when you use our
                platform to find open mics, manage your comedian profile, or
                browse events.
              </p>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-stone-900">
                2. Information We Collect
              </h2>
              <p className="mb-2">
                We collect information to provide a better experience:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>
                  <strong>Account Data:</strong> When you sign in via Google, we
                  store your email, display name, and profile picture.
                </li>
                <li>
                  <strong>User Content:</strong> Any events you submit, profile
                  bios, or images you upload are stored in our database.
                </li>
                <li>
                  <strong>Usage Data:</strong> We use analytics tools to
                  understand how users interact with our maps and features.
                </li>
              </ul>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-stone-900">
                3. Third-Party Services
              </h2>
              <p className="leading-relaxed">
                We utilize trusted third-party services to operate our platform.
                Your data may be processed by:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li>
                  <strong>Google Firebase:</strong> For authentication, database
                  storage, and image hosting.
                </li>
                <li>
                  <strong>Google Maps API:</strong> To display event locations
                  and calculate distances.
                </li>
                <li>
                  <strong>Vercel:</strong> For hosting our web infrastructure.
                </li>
              </ul>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-stone-900">
                4. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement security measures to protect your data. However, no
                method of transmission over the internet is 100% secure. While
                we strive to use commercially acceptable means to protect your
                personal data, we cannot guarantee its absolute security.
              </p>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-stone-900">
                5. Contact
              </h2>
              <p>
                If you have questions about this policy or wish to delete your
                data, please{" "}
                <Link
                  href="/contact"
                  className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
                >
                  Contact Us
                </Link>
              </p>
            </article>
          </div>

          <div className="mt-10 border-t border-stone-300 pt-6 text-center">
            <Link
              href="/"
              className="inline-block rounded-2xl bg-amber-700 px-6 py-3 font-bold shadow-lg transition-transform hover:scale-105 hover:bg-stone-800"
            >
              Return Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
