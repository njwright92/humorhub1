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
};

export default function ProfilePage() {
  return (
    <>
      <Header />
      <main className="flex flex-col p-2 text-zinc-200 text-center md:ml-20 min-h-screen">
        {/* ✅ LCP OPTIMIZATION: Static Text moved to Server Component */}
        <div className="flex flex-col items-center mb-8 mt-10 animate-fade-in">
          <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl rounded-lg text-3xl sm:text-5xl md:text-6xl lg:text-6xl text-center font-heading">
            Profile
          </h1>
          <p className="text-zinc-300 text-sm md:text-base mt-2">
            Manage your personal schedule
          </p>
        </div>

        {/* Client logic (Auth check, Interactive Grid) loads here */}
        <ProfileClient />
      </main>
      <Footer />
    </>
  );
}
