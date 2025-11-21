import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import Script from "next/script";

export const viewport: Viewport = {
  themeColor: "#18181b", // Matches bg-zinc-900
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
  // 💡 OPTIMIZATION: Handle Icons here, not via JavaScript injection
  icons: {
    apple: "/apple.png",
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
      {/* 
         1. GTM SCRIPT 
         Using 'afterInteractive' is the safest, high-perf method for GTM.
         'worker' often breaks DOM triggers (clicks, form submits) unless heavily configured.
      */}
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

      <body>
        {/* 2. GTM NOSCRIPT (Must be first inside body) */}
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

        {/* 3. MAIN CONTENT */}
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
