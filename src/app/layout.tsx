import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";
import Head from "next/head";

export const metadata = {
  title: "Humor Hub",
  description: "The goto platform for all things comedy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="The goto platform for all things comedy."
        />
        <title>Humor Hub</title>
        <link rel="icon" href="./micFinder.webp" type="image/webp" />
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
}
