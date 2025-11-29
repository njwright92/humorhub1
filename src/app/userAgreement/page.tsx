import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Agreement | Humor Hub",
  description:
    "Read the terms and conditions of using Humor Hub. Understand your rights and responsibilities.",
  alternates: {
    canonical: "https://www.thehumorhub.com/userAgreement",
  },
  openGraph: {
    title: "User Agreement | Humor Hub",
    description: "Terms and conditions for using the Humor Hub platform.",
    url: "https://www.thehumorhub.com/userAgreement",
    type: "website",
  },
};

export default function UserAgreementPage() {
  return (
    <>
      <main className="screen-container content-with-sidebar bg-zinc-900">
        <h1 className="title text-center mb-8">User Agreement</h1>

        <section className="bg-zinc-200 border border-zinc-300 p-8 max-w-4xl mx-auto shadow-xl rounded-xl">
          <p className="text-zinc-700 text-sm mb-6 border-b border-zinc-300 pb-4">
            <strong>Last Updated:</strong> Novemeber 2025
          </p>

          <div className="space-y-8 text-zinc-800">
            {/* 1. Acceptance */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                1. Acceptance of Terms
              </h2>
              <p className="text-zinc-800 leading-relaxed">
                By using Humor Hub, you agree to these Terms of Use. If you do
                not agree, please discontinue use of the platform immediately.
              </p>
            </div>

            {/* 2. Open Source */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                2. Open Source & License
              </h2>
              <p className="text-zinc-800 leading-relaxed mb-2">
                This project is provided under the <strong>MIT License</strong>.
                You are free to use, copy, and modify the software, provided
                that:
              </p>
              <ul className="list-disc list-inside text-zinc-800 pl-4 space-y-1">
                <li>The software is free of charge.</li>
                <li>
                  The software is provided &ldquo;as is&ldquo; without warranty.
                </li>
              </ul>
            </div>

            {/* 3. Responsibilities */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                3. User Responsibilities
              </h2>
              <p className="text-zinc-800 leading-relaxed">
                You are responsible for the content you upload (events,
                profiles, images). You agree not to use the platform for
                unlawful, harmful, or abusive behavior. We reserve the right to
                remove content that violates these standards.
              </p>
            </div>

            {/* 4. Disclaimers */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                4. Disclaimer & Liability
              </h2>
              <p className="text-zinc-800 leading-relaxed">
                Humor Hub is provided without warranties of any kind. The
                operators and contributors are not liable for any damages
                arising from the use or inability to use this platform.
              </p>
            </div>

            {/* 5. Contact */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                5. Contact
              </h2>
              <p className="text-zinc-800">
                Questions? Contact us at{" "}
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
