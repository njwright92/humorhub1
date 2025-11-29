import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Humor Hub",
  description:
    "Understand how Humor Hub collects, uses, and protects your personal information.",
  alternates: {
    canonical: "https://www.thehumorhub.com/privacyPolicy",
  },
  openGraph: {
    title: "Privacy Policy | Humor Hub",
    description: "Our commitment to protecting your data and privacy.",
    url: "https://www.thehumorhub.com/privacyPolicy",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="screen-container content-with-sidebar bg-zinc-900">
        <h1 className="title text-center mb-8">Privacy Policy</h1>

        <section className="bg-zinc-200 border border-zinc-300 p-8 max-w-4xl mx-auto shadow-xl rounded-xl">
          <p className="text-zinc-700 text-sm mb-6 border-b border-zinc-300 pb-4">
            <strong>Last Updated:</strong> November 2025
          </p>

          <div className="space-y-8 text-zinc-800">
            {/* 1. Introduction */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                1. Introduction
              </h2>
              <p className="text-zinc-800 leading-relaxed">
                At Humor Hub, we respect your privacy. This policy explains how
                we collect, use, and protect your information when you use our
                platform to find open mics, manage your comedian profile, or
                browse events.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                2. Information We Collect
              </h2>
              <p className="text-zinc-800 leading-relaxed mb-2">
                We collect information to provide a better experience:
              </p>
              <ul className="list-disc list-inside text-zinc-800 pl-4 space-y-1">
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
            </div>

            {/* 3. Third-Party Services */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                3. Third-Party Services
              </h2>
              <p className="text-zinc-800 leading-relaxed">
                We utilize trusted third-party services to operate our platform.
                Your data may be processed by:
              </p>
              <ul className="list-disc list-inside text-zinc-800 pl-4 space-y-1 mt-2">
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
            </div>

            {/* 4. Data Security */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                4. Data Security
              </h2>
              <p className="text-zinc-800 leading-relaxed">
                We implement security measures to protect your data. However, no
                method of transmission over the internet is 100% secure. While
                we strive to use commercially acceptable means to protect your
                personal data, we cannot guarantee its absolute security.
              </p>
            </div>

            {/* 5. Contact */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                5. Contact
              </h2>
              <p className="text-zinc-800">
                If you have questions about this policy or wish to delete your
                data, please contact us at{" "}
                <a
                  href="mailto:thehumorhub777@gmail.com"
                  className="text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  Humor Hub
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
            <Link
              href="/"
              className="btn bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-6 py-3 rounded-lg font-bold transition inline-block shadow-md"
            >
              Return Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
