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
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-4 text-center text-zinc-200 md:ml-24">
        <h1 className="font-heading mb-8 text-4xl font-bold tracking-wide text-amber-300 drop-shadow-xl sm:text-5xl md:text-6xl">
          User Agreement
        </h1>

        <section className="mx-auto max-w-4xl rounded-xl border border-zinc-300 bg-zinc-200 p-8 text-left text-zinc-800 shadow-2xl">
          <p className="mb-6 border-b border-zinc-300 pb-4 text-sm text-zinc-600">
            <strong>Last Updated:</strong> November 2025
          </p>

          <div className="space-y-8">
            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-zinc-900">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By using Humor Hub, you agree to these Terms of Use. If you do
                not agree, please discontinue use of the platform immediately.
              </p>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-zinc-900">
                2. Open Source & License
              </h2>
              <p className="mb-2">
                This project is provided under the <strong>MIT License</strong>.
                You are free to use, copy, and modify the software, provided
                that:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>The software is free of charge.</li>
                <li>
                  The software is provided &ldquo;as is&rdquo; without warranty.
                </li>
              </ul>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-zinc-900">
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
              <h2 className="font-heading mb-2 text-xl font-bold text-zinc-900">
                4. Disclaimer & Liability
              </h2>
              <p className="leading-relaxed">
                Humor Hub is provided without warranties of any kind. The
                operators and contributors are not liable for any damages
                arising from the use or inability to use this platform.
              </p>
            </article>

            <article>
              <h2 className="font-heading mb-2 text-xl font-bold text-zinc-900">
                5. Contact
              </h2>
              <p>
                Questions? Contact us at{" "}
                <a
                  href="mailto:thehumorhub777@gmail.com"
                  className="font-bold text-amber-700 underline transition-colors hover:text-amber-900"
                >
                  Humor Hub
                </a>
                .
              </p>
            </article>
          </div>

          <div className="mt-10 border-t border-zinc-300 pt-6 text-center">
            <Link
              href="/"
              className="inline-block rounded-lg bg-zinc-900 px-6 py-3 font-bold text-zinc-100 shadow-md transition-transform hover:scale-105 hover:bg-zinc-800"
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
