import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import AppProviders from "./components/AppProviders";
import AuthModalHost from "./components/authModalHost";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const comicNeue = Comic_Neue({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
  display: "optional",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#231a16",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thehumorhub.com"),
  title: {
    default: "Humor Hub - The Hub of Humor, Open Mics",
    template: "%s | Humor Hub",
  },
  description:
    "Discover the ultimate hub for everything comedy, featuring open mic events, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "comedy platform",
    "stand-up comedy",
    "funny jokes",
    "puns",
    "open mic events",
    "humor content",
    "AI comedy",
    "comedy writing tools",
    "best jokes",
    "comedy venues",
  ],
  openGraph: {
    title: "Humor Hub - The Go-To Platform for Everything Comedy",
    description:
      "Discover the ultimate destination for everything comedy. Explore open mic events, and more at Humor Hub.",
    url: "/",
    siteName: "Humor Hub",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={comicNeue.variable}>
      <body className="bg-stone-900 text-zinc-200 antialiased">
        <AppProviders>
          <Header />
          <AuthModalHost />
          {children}
          <Footer />
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
