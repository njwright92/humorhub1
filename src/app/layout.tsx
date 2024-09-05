import { ReactNode } from "react";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          href="/icon.png"
          type="image/png"
          sizes="any"
          className="rounded-full"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/" />

        {/* Default Open Graph / Social Sharing Metadata */}
        <meta property="og:site_name" content="Humor Hub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@natebug321" />
        <meta property="og:type" content="website" />
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
