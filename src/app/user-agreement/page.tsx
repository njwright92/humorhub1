import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Agreement | Humor Hub",
  description:
    "Read the terms and conditions of using Humor Hub. Understand your rights and responsibilities.",
  alternates: {
    canonical: "https://www.thehumorhub.com/user-agreement",
  },
};

export default function UserAgreementPage() {
  return (
    <main className="grid min-h-dvh content-start gap-8 p-2 pt-12 md:ml-20">
      <h1 className="page-title text-center">User Agreement</h1>
      <section className="panel-light">
        <p className="border-b border-zinc-300 pb-4 text-sm text-zinc-600">
          <strong>Last Updated:</strong> December 2025
        </p>
        <article className="grid gap-2">
          <h2 className="text-xl">1. Acceptance of Terms</h2>
          <p>
            By using Humor Hub, you agree to these Terms of Use. If you do not
            agree, please discontinue use of the platform immediately.
          </p>
        </article>
        <article className="grid gap-2">
          <h2 className="text-xl">2. Open Source & License</h2>
          <p>
            This project is provided under the <strong>MIT License</strong>. You
            are free to use, copy, and modify the software, provided that:
          </p>
          <ul className="grid list-inside list-disc gap-1 pl-4">
            <li>The software is free of charge.</li>
            <li>
              The software is provided &ldquo;as is&rdquo; without warranty.
            </li>
          </ul>
        </article>
        <article className="grid gap-2">
          <h2 className="text-xl">3. User Responsibilities</h2>
          <p>
            You are responsible for the content you upload (events, profiles,
            images). You agree not to use the platform for unlawful, harmful, or
            abusive behavior. We reserve the right to remove content that
            violates these standards.
          </p>
        </article>
        <article className="grid gap-2">
          <h2 className="text-xl">4. Disclaimer & Liability</h2>
          <p>
            Humor Hub is provided without warranties of any kind. The operators
            and contributors are not liable for any damages arising from the use
            or inability to use this platform.
          </p>
        </article>
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
          <Link href="/" className="btn-amber">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
