import type { Metadata } from "next";
import { ReactNode } from "react";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humor Hub - The Hub of Humor, Open Mics, and ComicBot",
  description:
    "Discover the ultimate hub for everything comedy, featuring open mic events, AI-driven ComicBot, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
  keywords:
    "comedy platform, stand-up comedy, funny jokes, puns, open mic events, comicbot, humor content, AI comedy, comedy writing tools, best jokes, comedy venues",
  openGraph: {
    title: "Humor Hub - The Hub of Humor, Open Mics, and ComicBot",
    description:
      "Discover the ultimate hub for everything comedy, featuring open mic events, AI-driven ComicBot, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
    url: "https://www.thehumorhub.com/",
    type: "website",
    images: [
      {
        url: "https://www.thehumorhub.com/images/og-image-home.jpg",
        alt: "Humor Hub Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@natebug321",
    title: "Humor Hub - The Hub of Humor, Open Mics, and ComicBot",
    description:
      "Discover the ultimate hub for everything comedy, featuring open mic events, AI-driven ComicBot, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
    images: [
      {
        url: "https://www.thehumorhub.com/images/og-image-home.jpg",
        alt: "Humor Hub Twitter Image",
      },
    ],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="apple-touch-icon" href="/apple.png" />

        {/* Favicon */}
        <link
          rel="icon"
          href="/icon.png"
          type="image/png"
          sizes="any"
          className="rounded-full"
        />

        {/* Open Graph and Twitter Metadata */}
        <meta property="og:site_name" content="Humor Hub" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Humor Hub - The Go-To Platform for Everything Comedy"
        />
        <meta
          property="og:description"
          content="Discover the ultimate destination for everything comedy. Explore jokes, puns, open mic events, and more at Humor Hub."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-home.jpg"
        />
      </head>
      <body>
        <CityProvider>
          <EventProvider>
            <HeadlineProvider>
              <div>{children}</div>
            </HeadlineProvider>
          </EventProvider>
        </CityProvider>
      </body>
    </html>
  );
};

export default RootLayout;
