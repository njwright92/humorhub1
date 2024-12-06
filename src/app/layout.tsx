import type { Metadata } from "next";
import { ReactNode } from "react";
import { HeadlineProvider } from "./components/headlinecontext";
import "./globals.css";
import Script from "next/script";

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
  },
  twitter: {
    card: "summary_large_image",
    creator: "@natebug321",
    title: "Humor Hub - The Hub of Humor, Open Mics, and ComicBot",
    description:
      "Discover the ultimate hub for everything comedy, featuring open mic events, AI-driven ComicBot, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const GTM_ID = "GTM-KVJSFKV8";

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
        <meta charSet="UTF-8" />
        <link rel="apple-touch-icon" href="/apple.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
            aria-hidden
          ></iframe>
        </noscript>
        <HeadlineProvider>
          <div>{children}</div>
        </HeadlineProvider>
      </body>
    </html>
  );
};

export default RootLayout;
