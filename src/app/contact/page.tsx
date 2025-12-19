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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center md:ml-20">
      <header className="animate-fade-in mb-8 w-full max-w-4xl">
        <h1 className="font-heading mb-2 text-3xl font-bold tracking-wide text-amber-700 text-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
          Contact Us
        </h1>
        <p className="text-sm text-zinc-300 sm:text-base">
          Questions, feedback, or support? We&#39;re here to help.
        </p>
      </header>
      <ContactForm />
    </main>
  );
}
