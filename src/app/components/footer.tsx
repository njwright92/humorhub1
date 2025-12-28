import Link from "next/link";
import Image from "next/image";
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
      <div className="mx-auto grid max-w-screen-2xl gap-4 p-2 lg:gap-6">
        <h2 id="footer-heading" className="sr-only">
          Site Footer
        </h2>

        <header className="grid justify-items-center gap-2">
          <h3 className="font-heading text-center text-2xl font-extrabold tracking-wide text-shadow-sm md:text-4xl">
            Humor Hub
          </h3>
          <p className="max-w-2xl text-center text-stone-300 md:text-lg">
            The Hub of Humor, Connecting comics and fans globally. Join the fun!
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
          <Link
            href="/"
            aria-label="Humor Hub Home"
            className="group justify-self-center md:justify-self-start md:pl-10"
          >
            <Image
              src="/logo.webp"
              alt=""
              width={80}
              height={80}
              className="rounded-full object-contain shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3"
              quality={70}
            />
          </Link>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:pr-10">
            <nav
              aria-labelledby="about-nav"
              className="grid content-start gap-2"
            >
              <h3 id="about-nav" className={headingClass}>
                Get to Know Us
              </h3>
              <ul className="grid gap-2 font-medium text-stone-400">
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

            <nav
              aria-labelledby="social-nav"
              className="grid content-start gap-2"
            >
              <h3 id="social-nav" className={headingClass}>
                Stay Connected
              </h3>
              <ul className="grid gap-2 font-medium text-stone-400">
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

            <nav
              aria-labelledby="legal-nav"
              className="grid content-start gap-2"
            >
              <h3 id="legal-nav" className={headingClass}>
                Legal Info
              </h3>
              <ul className="grid gap-2 font-medium text-stone-400">
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

        <div className="grid items-center gap-2 border-t border-stone-400 pt-2 sm:grid-cols-[1fr_auto_1fr]">
          <small className="font-mono text-xs text-stone-400 sm:col-start-2 md:text-sm">
            © {new Date().getFullYear()} Humor Hub™. All rights reserved.
          </small>
          <ScrollToTop className="justify-self-center sm:col-start-3 sm:justify-self-end" />
        </div>
      </div>
    </footer>
  );
}
