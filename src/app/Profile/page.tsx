import type { Metadata } from "next";
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

export default function ProfilePage() {
  return (
    <>
      <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      <link rel="preconnect" href="https://humorhub-73ff9.firebaseapp.com" />
      <main className="grid min-h-dvh content-start gap-4 p-2 pt-12 text-center md:ml-20">
        <h1 className="text-3xl font-bold tracking-wide text-amber-700 md:text-4xl lg:text-5xl">
          Profile Management
        </h1>
        <p className="text-sm text-stone-300 md:text-lg">
          Manage your personal schedule
        </p>
        <ProfileClient />
      </main>
    </>
  );
}
