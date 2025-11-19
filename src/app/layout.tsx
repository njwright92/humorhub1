import type { Metadata } from "next";
import { ReactNode } from "react";
import { HeadlineProvider } from "./components/headlinecontext";
import "./globals.css";
import Script from "next/script";

// 💡 Using an array for keywords is cleaner and standard practice.
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
  // 💡 Note: og:site_name is now included here instead of manual <meta> tags.
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
  // Charset and Viewport are handled automatically by Next.js when omitted here.
};

interface RootLayoutProps {
  children: ReactNode;
}

const GTM_ID = "GTM-KVJSFKV8";

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      {/* 🛑 REMOVED MANUAL <head> TAG 
          (This prevents hydration errors and leverages Next.js automatic metadata handling) 
      */}

      {/* 1. GTM SCRIPT OPTIMIZATION 
          Using strategy="worker" offloads the script to a web worker, reducing main thread blocking. 
      */}
      <Script
        id="gtm-script"
        strategy="worker"
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

      {/* 2. APPLE TOUCH ICON SCRIPT OPTIMIZATION 
          Using lazyOnload ensures this non-critical resource loads after the main content.
      */}
      <Script
        id="apple-touch-icon-link"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
          const link = document.createElement('link');
          link.rel = 'apple-touch-icon';
          link.href = '/apple.png';
          document.head.appendChild(link);
        `,
        }}
      />

      <body>
        {/* 3. GTM NOSCRIPT TAG 
            Must be the first element inside <body>. Added aria-hidden="true" for accessibility.
        */}
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

        {/* 4. REMOVED REDUNDANT DIV
            The children are wrapped directly by HeadlineProvider.
        */}
        <HeadlineProvider>{children}</HeadlineProvider>
      </body>
    </html>
  );
};

export default RootLayout;
