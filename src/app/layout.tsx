import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";

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
