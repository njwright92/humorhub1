import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "User Agreement | Humor Hub",
  description: "Read the terms and conditions of using Humor Hub.",
  alternates: { canonical: "/user-agreement" },
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using Humor Hub, you agree to these Terms. If you do not agree, discontinue use immediately.",
  },
  {
    title: "2. License",
    content:
      "This project is provided under the MIT License. It is provided 'as is' without warranty.",
  },
  {
    title: "3. User Responsibilities",
    content:
      "You are responsible for content you upload. We reserve the right to remove harmful content.",
  },
  {
    title: "4. Liability",
    content:
      "Operators and contributors are not liable for any damages arising from the use of this platform.",
  },
];

export default function UserAgreementPage() {
  return (
    <LegalPage title="User Agreement" updated="May 2026" sections={SECTIONS} />
  );
}
