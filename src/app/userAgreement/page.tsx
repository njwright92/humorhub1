import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="flex min-h-screen flex-col p-4 md:ml-20">
      <h1 className="font-heading mt-10 mb-8 text-center text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-4xl">
        User Agreement
      </h1>
      <section className="mx-auto max-w-4xl rounded-2xl border border-stone-300 bg-zinc-200 p-6 text-left leading-relaxed text-stone-900 shadow-lg">
        <p className="mb-6 border-b border-zinc-300 pb-4 text-sm text-zinc-600">
          <strong>Last Updated:</strong> November 2025
        </p>
        <div className="space-y-8">
          <article>
            <h2 className="font-heading mb-2 text-xl font-bold">
              1. Acceptance of Terms
            </h2>
            <p>
              By using Humor Hub, you agree to these Terms of Use. If you do not
              agree, please discontinue use of the platform immediately.
            </p>
          </article>
          <article>
            <h2 className="font-heading mb-2 text-xl font-bold">
              2. Open Source & License
            </h2>
            <p className="mb-2">
              This project is provided under the <strong>MIT License</strong>.
              You are free to use, copy, and modify the software, provided that:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>The software is free of charge.</li>
              <li>
                The software is provided &ldquo;as is&rdquo; without warranty.
              </li>
            </ul>
          </article>
          <article>
            <h2 className="font-heading mb-2 text-xl font-bold">
              3. User Responsibilities
            </h2>
            <p>
              You are responsible for the content you upload (events, profiles,
              images). You agree not to use the platform for unlawful, harmful,
              or abusive behavior. We reserve the right to remove content that
              violates these standards.
            </p>
          </article>
          <article>
            <h2 className="font-heading mb-2 text-xl font-bold">
              4. Disclaimer & Liability
            </h2>
            <p>
              Humor Hub is provided without warranties of any kind. The
              operators and contributors are not liable for any damages arising
              from the use or inability to use this platform.
            </p>
          </article>
          <article>
            <h2 className="font-heading mb-2 text-xl font-bold">5. Contact</h2>
            <p>
              Questions? Contact us at{" "}
              <Link
                href="/contact"
                className="font-bold text-blue-700 underline transition-colors hover:text-blue-900"
              >
                Contact Us
              </Link>{" "}
              .
            </p>
          </article>
        </div>
        <div className="mt-10 border-t border-stone-300 pt-6 text-center">
          <Link
            href="/"
            className="inline-block rounded-2xl bg-amber-700 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-amber-800"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
