import React, { ReactNode } from "react";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Head from "next/head";

interface RootLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

export const metadata = {
  title: "Humor Hub",
  description: "The goto platform for anything comedy.",
  keywords:
    "comedy, humor, funny, jokes, jokes, riddles, riddles, puns, puns, jokes, jokes, riddles, riddles, puns, puns, jokes, jokes, riddles, riddles, puns, puns",
};

const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  title = metadata.title,
  description = metadata.description,
  keywords = metadata.keywords,
}) => {
  return (
    <html lang="en">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          href="/icon.png"
          type="image/png"
          sizes="any"
          className="rounded-full"
        />
        <li rel="apple-touch-icon" ref="apple-touch-icon.png" />
        <link rel="canonical" href="https://www.thehumorhub.com/" />
        <meta
          property="og:title"
          content="Humor Hub - The Go-To Platform for Comedy"
        />
        <meta
          property="og:description"
          content="Discover the ultimate destination for everything comedy. Explore jokes, puns, open mic events, and more at Humor Hub."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-home.jpg"
        />
      </Head>
      <body>
        <CityProvider>
          <EventProvider>
            <HeadlineProvider>
              <div>{children}</div>
              <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!}
              />
            </HeadlineProvider>
          </EventProvider>
        </CityProvider>
      </body>
    </html>
  );
};

export default RootLayout;
