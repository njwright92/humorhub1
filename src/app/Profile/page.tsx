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
    <main className="flex min-h-screen flex-col p-2 text-center md:ml-20">
      <header className="animate-fade-in mt-10 mb-8 flex flex-col items-center">
        <h1 className="font-heading text-3xl font-bold tracking-wider text-amber-700 text-shadow-sm sm:text-4xl md:text-5xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-stone-300 md:text-base">
          Manage your personal schedule
        </p>
      </header>
      <ProfileClient />
    </main>
  );
}
