import Head from "next/head";
import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";

export const metadata = {
  title: "Humor Hub",
  description: "The goto platform for comedy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CityProvider>
        <EventProvider>
          <body>{children}</body>
        </EventProvider>
      </CityProvider>
    </html>
  );
}
