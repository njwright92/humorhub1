import Link from "next/link";
import Image from "next/image";
import hh from "../../app/logo.webp";
import ScrollToTop from "./ScrollToTop";

const linkClass =
  "transition-colors hover:text-amber-700 hover:underline md:text-lg";
const headingClass =
  "font-heading mb-4 text-lg font-extrabold uppercase tracking-wider whitespace-nowrap text-amber-600 md:mb-6 md:text-xl";

const SOCIALS = [
  { href: "https://twitter.com/naterbug321", label: "X (Twitter)" },
  { href: "https://www.facebook.com/nate_wrigh", label: "Facebook" },
  { href: "https://www.instagram.com/nate_wright3", label: "Instagram" },
  { href: "https://github.com/njwright92", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-stone-500 md:ml-20"
      aria-labelledby="footer-heading"
    >
      <div className="mx-auto max-w-screen-2xl p-4 py-6 lg:py-8">
        <h2 id="footer-heading" className="sr-only">
          Site Footer
        </h2>

        <h3 className="font-heading mb-4 text-center text-2xl font-extrabold tracking-wide text-shadow-sm md:text-4xl">
          Humor Hub
        </h3>

        <p className="mx-auto mb-6 max-w-2xl text-center text-stone-300 md:text-lg">
          The Hub of Humor, Connecting comics and fans globally. Join the fun!
        </p>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <Link
            href="/"
            aria-label="Humor Hub Home"
            className="group mb-6 flex justify-center md:mb-0 md:w-1/4 md:justify-start md:pl-10"
          >
            <Image
              src={hh}
              alt=""
              width={80}
              height={80}
              className="rounded-full object-contain shadow-lg group-hover:scale-110 group-hover:rotate-3"
              quality={70}
            />
          </Link>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6 md:w-3/4 md:pr-10">
            <nav aria-labelledby="about-nav">
              <h3 id="about-nav" className={headingClass}>
                Get to Know Us
              </h3>
              <ul className="space-y-3 font-medium text-stone-400 md:space-y-4">
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

            <nav aria-labelledby="social-nav">
              <h3 id="social-nav" className={headingClass}>
                Stay Connected
              </h3>
              <ul className="space-y-3 font-medium text-stone-400 md:space-y-4">
                {SOCIALS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {label}
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="legal-nav">
              <h3 id="legal-nav" className={headingClass}>
                Legal Info
              </h3>
              <ul className="space-y-3 font-medium text-stone-400 md:space-y-4">
                <li>
                  <Link href="/user-agreement" className={linkClass}>
                    User Agreement
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className={linkClass}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-400 pt-2 sm:flex-row-reverse sm:gap-0">
          <ScrollToTop />
          <small className="font-mono text-xs text-stone-400 md:text-sm">
            © {new Date().getFullYear()} Humor Hub™. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}
