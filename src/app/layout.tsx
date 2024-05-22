import React, { ReactNode } from "react";
import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";

export const metadata = {
  title: "Humor Hub",
  description: "The goto platform for all things comedy.",
};

export const viewport = "width=device-width, initial-scale=1.0";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <>
      <link
        rel="icon"
        href="/icon.png"
        type="image/png"
        sizes="any"
        className="rounded-full"
      />
      <html lang="en">
        <CityProvider>
          <EventProvider>
            <HeadlineProvider>
              <body>{children}</body>
            </HeadlineProvider>
          </EventProvider>
        </CityProvider>
      </html>
    </>
  );
};

export default RootLayout;
