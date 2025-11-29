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
    images: [
      {
        url: "https://www.thehumorhub.com/images/og-image-profile.jpg",
        width: 1200,
        height: 630,
        alt: "Humor Hub Profile",
      },
    ],
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
