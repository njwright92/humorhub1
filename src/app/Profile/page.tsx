import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

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
    index: false, // Profile pages shouldn't be indexed
    follow: true,
  },
};

export default function ProfilePage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-2 text-center text-zinc-200 md:ml-20">
        <header className="animate-fade-in mt-10 mb-8 flex flex-col items-center">
          <h1 className="font-heading text-3xl font-bold tracking-wide text-amber-300 drop-shadow-xl sm:text-5xl md:text-6xl">
            Profile
          </h1>
          <p className="mt-2 text-sm text-zinc-300 md:text-base">
            Manage your personal schedule
          </p>
        </header>

        <ProfileClient />
      </main>
      <Footer />
    </>
  );
}
