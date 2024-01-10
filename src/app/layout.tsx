import type { Metadata } from "next";
import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";

export const metadata: Metadata = {
  title: "Humor Hub",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <CityProvider>
      <EventProvider>
        
      <body>{children}</body>
      </EventProvider>
      </CityProvider>
    </html>
  );
}
