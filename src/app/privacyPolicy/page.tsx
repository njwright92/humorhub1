import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";

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
      <Header />
      <main className="flex flex-col items-center justify-center p-4 text-zinc-200 text-center md:ml-24 min-h-screen bg-zinc-900">
        <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl text-4xl sm:text-5xl md:text-6xl mb-8 font-heading">
          Privacy Policy
        </h1>

        <section className="bg-zinc-200 border border-zinc-300 p-8 max-w-4xl mx-auto shadow-2xl rounded-xl text-left text-zinc-800">
          <p className="text-zinc-600 text-sm mb-6 border-b border-zinc-300 pb-4">
            <strong>Last Updated:</strong> November 2025
          </p>

          <div className="space-y-8">
            <article>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
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
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                2. Information We Collect
              </h2>
              <p className="mb-2">
                We collect information to provide a better experience:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1">
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
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                3. Third-Party Services
              </h2>
              <p className="leading-relaxed">
                We utilize trusted third-party services to operate our platform.
                Your data may be processed by:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1 mt-2">
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
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
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
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                5. Contact
              </h2>
              <p>
                If you have questions about this policy or wish to delete your
                data, please{" "}
                <Link
                  href="/contact"
                  className="underline font-bold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  Contact Us
                </Link>
              </p>
            </article>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-300 text-center">
            <Link
              href="/"
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-6 py-3 rounded-lg font-bold transition-transform hover:scale-105 inline-block shadow-md"
            >
              Return Home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
