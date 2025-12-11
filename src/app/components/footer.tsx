import Link from "next/link";
import Image from "next/image";
import hh from "../../app/hh.webp";
import dynamic from "next/dynamic";

const ScrollToTop = dynamic(() => import("./ScrollToTop"), {
  loading: () => <div className="size-10" aria-hidden="true" />,
});

// Shared link styles
const linkClass =
  "transition-colors hover:text-amber-300 hover:underline md:text-lg";

// External link with accessibility
function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-zinc-500 bg-zinc-900 md:ml-20"
      aria-labelledby="footer-heading"
    >
      <div className="mx-auto max-w-screen-2xl p-4 py-6 lg:py-8">
        <h2 id="footer-heading" className="sr-only">
          Site Footer
        </h2>

        <p className="font-heading mb-2 text-center text-2xl font-extrabold tracking-wide text-zinc-200 md:text-4xl">
          Humor Hub - The Hub of Humor!
        </p>

        <p className="mx-auto mb-8 max-w-2xl text-center text-zinc-400 md:text-xl">
          Connecting comics and fans with events, tools, and more. Join the fun!
        </p>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Humor Hub Home"
            className="group mb-6 flex justify-center md:mb-0 md:w-1/4 md:justify-start md:pl-10"
          >
            <Image
              src={hh}
              alt=""
              width={100}
              height={100}
              className="rounded-full border-4 border-zinc-800 object-contain shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3 group-hover:border-amber-300"
              loading="lazy"
              quality={70}
            />
          </Link>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6 md:w-3/4 md:pr-10">
            {/* About Nav */}
            <nav aria-labelledby="about-nav">
              <h3
                id="about-nav"
                className="font-heading mb-4 text-lg font-extrabold tracking-wider whitespace-nowrap text-zinc-200 uppercase md:mb-6 md:text-xl"
              >
                Get to Know Us
              </h3>
              <ul className="space-y-3 font-medium text-zinc-400 md:space-y-4">
                <li>
                  <Link href="/about" className={linkClass}>
                    About Humor Hub
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={linkClass}>
                    Contact Our Team
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Social Nav */}
            <nav aria-labelledby="social-nav">
              <h3
                id="social-nav"
                className="font-heading mb-4 text-lg font-extrabold tracking-wider whitespace-nowrap text-zinc-200 uppercase md:mb-6 md:text-xl"
              >
                Stay Connected
              </h3>
              <ul className="space-y-3 font-medium text-zinc-400 md:space-y-4">
                <li>
                  <ExternalLink href="https://twitter.com/naterbug321">
                    X (Twitter)
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href="https://www.facebook.com/nate_wrigh">
                    Facebook
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href="https://www.instagram.com/nate_wright3">
                    Instagram
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href="https://github.com/njwright92">
                    GitHub
                  </ExternalLink>
                </li>
              </ul>
            </nav>

            {/* Legal Nav */}
            <nav aria-labelledby="legal-nav">
              <h3
                id="legal-nav"
                className="font-heading mb-4 text-lg font-extrabold tracking-wider whitespace-nowrap text-zinc-200 uppercase md:mb-6 md:text-xl"
              >
                Legal Info
              </h3>
              <ul className="space-y-3 font-medium text-zinc-400 md:space-y-4">
                <li>
                  <Link href="/userAgreement" className={linkClass}>
                    User Agreement
                  </Link>
                </li>
                <li>
                  <Link href="/privacyPolicy" className={linkClass}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-950 pt-4 sm:flex-row-reverse sm:gap-0">
          <ScrollToTop />

          <small className="font-mono text-xs text-zinc-400 md:text-sm">
            © {currentYear} Humor Hub™. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}
