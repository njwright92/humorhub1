import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Humor Hub",
  description:
    "Understand how Humor Hub collects and protects your information.",
  alternates: { canonical: "/privacy-policy" },
};

const SECTIONS = [
  {
    title: "1. Introduction",
    content:
      "At Humor Hub, we respect your privacy. This policy explains how we collect and protect your data when you find open mics or manage your profile.",
  },
  {
    title: "2. Information We Collect",
    content: "We collect information to provide a better experience:",
    list: [
      "Account Data: Email and name via Google.",
      "User Content: Events and bios.",
      "Usage Data: Analytics for map optimization.",
    ],
  },
  {
    title: "3. Third-Party Services",
    content:
      "Your data may be processed by Google Firebase, Google Maps API, and Vercel.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement security measures to protect your data. However, no method of internet transmission is 100% secure.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 2026" sections={SECTIONS} />
  );
}
