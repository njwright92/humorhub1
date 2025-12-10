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
      <ProfileClient />
      <Footer />
    </>
  );
}
