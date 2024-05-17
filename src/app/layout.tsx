import React, { ReactNode } from "react";
import Head from "next/head";
import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";

export const metadata = {
  title: "Humor Hub",
  description: "The goto platform for all things comedy.",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
        <link
          rel="icon"
          href="/icon.png"
          type="image/png"
          sizes="any"
          className="rounded-full"
        />
      </Head>
      <CityProvider>
        <EventProvider>
          <HeadlineProvider>
            <body>{children}</body>
          </HeadlineProvider>
        </EventProvider>
      </CityProvider>
    </html>
  );
};

export default RootLayout;
