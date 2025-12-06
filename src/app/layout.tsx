import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./components/ToastContext";

const comicNeue = Comic_Neue({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thehumorhub.com"),
  title: {
    default: "Humor Hub - The Hub of Humor, Open Mics",
    template: "%s | Humor Hub",
  },
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
      "Discover the ultimate destination for everything comedy. Explore open mic events, and more at Humor Hub.",
    url: "https://www.thehumorhub.com/",
    siteName: "Humor Hub",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://humorhub-73ff9.firebaseapp.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link
          rel="dns-prefetch"
          href="https://humorhub-73ff9.firebaseapp.com"
        />
      </head>
      <body
        className={`${comicNeue.variable} bg-zinc-900 text-zinc-200 antialiased`}
      >
        <Script
          id="gtm-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
      function loadGTM() {
        if (window.gtmLoaded) return;
        window.gtmLoaded = true;
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-KVJSFKV8');
      }
    `,
          }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
