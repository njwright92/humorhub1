import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

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
    <>
      <Header />
      <main className="flex flex-col items-center justify-center p-4 text-zinc-200 text-center md:ml-20 min-h-screen">
        <div className="w-full max-w-4xl animate-fade-in">
          <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl text-4xl sm:text-5xl md:text-6xl mb-2 font-heading">
            Contact Us
          </h1>
          <p className="text-zinc-300 mb-8">
            Questions, feedback, or support? We&#39;re here to help.
          </p>

          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
