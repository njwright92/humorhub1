import type { Metadata } from "next";
import Link from "next/link";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Your Profile - Manage Your Humor Hub Account",
  description:
    "Access and manage your Humor Hub profile. Update your information, preferences, and view your favorite content.",
  keywords: [
    "Humor Hub profile",
    "manage account",
    "update profile",
    "comedy account",
  ],
  alternates: {
    canonical: "https://www.thehumorhub.com/Profile",
  },
  openGraph: {
    title: "Your Profile - Manage Your Humor Hub Account",
    description:
      "Access and manage your Humor Hub profile. Update your information, preferences, and view your favorite content.",
    url: "https://www.thehumorhub.com/Profile",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

function ProfileSkeleton() {
  return (
    <div className="grid flex-1 place-content-center" role="status">
      <div className="grid w-64 animate-pulse gap-4">
        <div className="h-8 rounded-2xl bg-stone-700" />
        <div className="mx-auto size-36 rounded-full bg-stone-700" />
        <div className="h-4 rounded-2xl bg-stone-700" />
        <div className="mx-auto h-4 w-1/2 rounded-2xl bg-stone-700" />
      </div>
      <span className="sr-only">Loading profile...</span>
    </div>
  );
}

function SignInPrompt() {
  return (
    <section className="mx-auto mt-10 grid max-w-md gap-4 rounded-2xl border border-stone-700 bg-stone-800 p-8 text-center shadow-lg">
      <span className="text-6xl" aria-hidden="true">
        🔐
      </span>
      <h2 className="text-2xl text-amber-700">Sign In Required</h2>
      <p className="text-stone-400">
        Please sign in to view your profile and saved events.
      </p>
      <Link
        href="/mic-finder"
        className="cursor-pointer justify-self-center rounded-2xl bg-amber-700 px-6 py-3 font-bold text-stone-900 shadow-lg transition-transform hover:scale-105"
      >
        Go to MicFinder
      </Link>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <>
      <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      <link rel="preconnect" href="https://humorhub-73ff9.firebaseapp.com" />
      <main className="grid min-h-dvh content-start gap-4 p-2 pt-12 text-center md:ml-20">
        <h1 className="page-title">Profile Management</h1>
        <p className="text-sm text-stone-300 md:text-lg">
          Manage your personal schedule
        </p>
        <ProfileClient
          skeleton={<ProfileSkeleton />}
          signInPrompt={<SignInPrompt />}
        />
      </main>
    </>
  );
}
