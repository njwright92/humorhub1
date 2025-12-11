import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "User Agreement | Humor Hub",
  description:
    "Read the terms and conditions of using Humor Hub. Understand your rights and responsibilities.",
  alternates: {
    canonical: "https://www.thehumorhub.com/userAgreement",
  },
};

export default function UserAgreementPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center p-4 text-zinc-200 text-center md:ml-24 min-h-screen bg-zinc-900">
        <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl text-4xl sm:text-5xl md:text-6xl mb-8 font-heading">
          User Agreement
        </h1>

        <section className="bg-zinc-200 border border-zinc-300 p-8 max-w-4xl mx-auto shadow-2xl rounded-xl text-left text-zinc-800">
          <p className="text-zinc-600 text-sm mb-6 border-b border-zinc-300 pb-4">
            <strong>Last Updated:</strong> November 2025
          </p>

          <div className="space-y-8">
            <article>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By using Humor Hub, you agree to these Terms of Use. If you do
                not agree, please discontinue use of the platform immediately.
              </p>
            </article>

            <article>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                2. Open Source & License
              </h2>
              <p className="mb-2">
                This project is provided under the <strong>MIT License</strong>.
                You are free to use, copy, and modify the software, provided
                that:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>The software is free of charge.</li>
                <li>
                  The software is provided &ldquo;as is&rdquo; without warranty.
                </li>
              </ul>
            </article>

            <article>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                3. User Responsibilities
              </h2>
              <p className="leading-relaxed">
                You are responsible for the content you upload (events,
                profiles, images). You agree not to use the platform for
                unlawful, harmful, or abusive behavior. We reserve the right to
                remove content that violates these standards.
              </p>
            </article>

            <article>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                4. Disclaimer & Liability
              </h2>
              <p className="leading-relaxed">
                Humor Hub is provided without warranties of any kind. The
                operators and contributors are not liable for any damages
                arising from the use or inability to use this platform.
              </p>
            </article>

            <article>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">
                5. Contact
              </h2>
              <p>
                Questions? Contact us at{" "}
                <a
                  href="mailto:thehumorhub777@gmail.com"
                  className="text-amber-700 hover:text-amber-900 underline transition-colors font-bold"
                >
                  Humor Hub
                </a>
                .
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
