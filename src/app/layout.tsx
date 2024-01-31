import "./globals.css";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";

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
          <body>{children}</body>
        </EventProvider>
      </CityProvider>
    </html>
  );
}
