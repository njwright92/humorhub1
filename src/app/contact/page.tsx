import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Humor Hub",
  description:
    "Have questions or feedback? Contact the Humor Hub team for support and inquiries.",
  alternates: {
    canonical: "https://www.thehumorhub.com/contact",
  },
  openGraph: {
    title: "Contact Us | Humor Hub",
    description: "Contact Humor Hub for inquiries, feedback, or support.",
    url: "https://www.thehumorhub.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="grid min-h-dvh content-start gap-6 p-2 pt-12 text-center md:ml-20">
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-wide text-amber-700 text-shadow-md md:text-4xl lg:text-5xl">
          Contact Us
        </h1>
        <p className="text-sm text-stone-300 md:text-base">
          Questions, feedback, or support? We&#39;re here to help.
        </p>
      </header>
      <ContactForm />
    </main>
  );
}
