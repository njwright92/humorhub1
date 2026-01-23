import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import dynamic from "next/dynamic";

const ToastProvider = dynamic(() =>
  import("./components/ToastContext").then((mod) => mod.ToastProvider),
);

const Analytics = dynamic(() =>
  import("@vercel/analytics/react").then((mod) => mod.Analytics),
);

const comicNeue = Comic_Neue({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#18181b",
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
    url: "https://www.thehumorhub.com/",
    siteName: "Humor Hub",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={comicNeue.variable}>
      <body className="bg-stone-900 text-zinc-200 antialiased">
        <ToastProvider>
          <Header />
          {children}
          <Footer />
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
