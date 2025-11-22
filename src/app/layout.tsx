import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import Script from "next/script";
import { Comic_Neue, Rubik } from "next/font/google";

// 1. Configure Comic Neue
const comicNeue = Comic_Neue({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
  display: "swap",
});

// 2. Configure Rubik
const rubik = Rubik({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Humor Hub - The Hub of Humor, Open Mics",
  description:
    "Discover the ultimate hub for everything comedy, featuring open mic events, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
  keywords: [
    "comedy platform",
    "stand-up comedy",
    "funny jokes",
    "puns",
    "open mic events",
    "humor content",
    "AI comedy",
    "comedy writing tools",
    "best jokes",
    "comedy venues",
  ],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎤</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Humor Hub - The Go-To Platform for Everything Comedy",
    description:
      "Discover the ultimate destination for everything comedy. Explore jokes, puns, open mic events, and more at Humor Hub.",
    url: "https://www.thehumorhub.com/",
    siteName: "Humor Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@natebug321",
    title: "Humor Hub - The Hub of Humor, Open Mics",
    description:
      "Discover the ultimate hub for everything comedy, featuring open mic events, and comedy tools. Explore jokes, puns, and more at Humor Hub.",
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
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
      </head>

      <body
        className={`${comicNeue.variable} ${rubik.variable} bg-zinc-900 text-zinc-200 antialiased`}
      >
        <Script
          id="gtm-script"
          strategy="lazyOnload"
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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager Noscript"
            aria-hidden="true"
          ></iframe>
        </noscript>

        {children}
      </body>
    </html>
  );
};

export default RootLayout;
