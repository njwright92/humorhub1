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
    <main className="flex min-h-screen flex-col p-4 text-center md:ml-20">
      <h1 className="font-heading mt-10 mb-4 text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-4xl">
        Profile Management
      </h1>
      <p className="mb-6 text-sm text-stone-300 md:text-lg">
        Manage your personal schedule
      </p>
      <ProfileClient />
    </main>
  );
}
