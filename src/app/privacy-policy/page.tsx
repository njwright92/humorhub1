import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Humor Hub",
  description:
    "Understand how Humor Hub collects, uses, and protects your personal information.",
  alternates: {
    canonical: "https://www.thehumorhub.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell gap-8">
      <h1 className="page-title text-center">Privacy Policy</h1>
      <section className="panel-light">
        <p className="border-b border-zinc-300 pb-4 text-sm text-zinc-600">
          <strong>Last Updated:</strong> December 2025
        </p>
        <article className="grid gap-2">
          <h2 className="text-xl">1. Introduction</h2>
          <p>
            At Humor Hub, we respect your privacy. This policy explains how we
            collect, use, and protect your information when you use our platform
            to find open mics, manage your comedian profile, or browse events.
          </p>
        </article>
        <article className="grid gap-2">
          <h2 className="text-xl">2. Information We Collect</h2>
          <p>We collect information to provide a better experience:</p>
          <ul className="grid list-inside list-disc gap-1 pl-4">
            <li>
              <strong>Account Data:</strong> When you sign in via Google, we
              store your email, display name, and profile picture.
            </li>
            <li>
              <strong>User Content:</strong> Any events you submit, profile
              bios, or images you upload are stored in our database.
            </li>
            <li>
              <strong>Usage Data:</strong> We use analytics tools to understand
              how users interact with our maps and features.
            </li>
          </ul>
        </article>
        <article className="grid gap-2">
          <h2 className="text-xl">3. Third-Party Services</h2>
          <p>
            We utilize trusted third-party services to operate our platform.
            Your data may be processed by:
          </p>
          <ul className="grid list-inside list-disc gap-1 pl-4">
            <li>
              <strong>Google Firebase:</strong> For authentication, database
              storage, and image hosting.
            </li>
            <li>
              <strong>Google Maps API:</strong> To display event locations and
              calculate distances.
            </li>
            <li>
              <strong>Vercel:</strong> For hosting our web infrastructure.
            </li>
          </ul>
        </article>
        <article className="grid gap-2">
          <h2 className="text-xl">4. Data Security</h2>
          <p>
            We implement security measures to protect your data. However, no
            method of transmission over the internet is 100% secure. While we
            strive to use commercially acceptable means to protect your personal
            data, we cannot guarantee its absolute security.
          </p>
        </article>
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
          <Link href="/" className="btn-amber">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
