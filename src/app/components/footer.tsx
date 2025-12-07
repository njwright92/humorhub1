import Link from "next/link";
import Image from "next/image";
import hh from "../../app/hh.webp"; // Adjust path if needed based on your folder structure
import ScrollToTop from "./ScrollToTop";

export default function Footer() {
  return (
    <footer
      className="bg-zinc-900 md:ml-20 border-t border-zinc-800"
      aria-labelledby="footer-heading"
      id="footer"
    >
      <div className="mx-auto w-full max-w-screen-2xl p-4 py-6 lg:py-8">
        {/* Main Footer Title */}
        <h1
          id="footer-heading"
          className="text-2xl md:text-4xl font-extrabold text-zinc-200 mb-2 text-center tracking-wide font-heading"
        >
          Humor Hub - The Hub of Humor!
        </h1>

        <p className="text-md md:text-xl mb-8 text-center text-zinc-400 max-w-2xl mx-auto font-normal font-sans">
          Connecting comics and fans with events, tools, and more. Join the fun!
        </p>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Logo Section */}
          <Link
            href="/"
            aria-label="Humor Hub Home"
            className="group flex justify-center md:justify-start md:w-1/4 md:pl-10 mb-6 md:mb-0"
          >
            <Image
              src={hh}
              alt="Humor Hub Logo"
              width={120}
              height={120}
              className="rounded-full shadow-xl transition-transform transform group-hover:scale-110 group-hover:rotate-3 border-4 border-zinc-800 group-hover:border-amber-300 object-contain w-auto h-auto"
              sizes="(max-width: 768px) 100px, 120px"
              loading="lazy"
            />
          </Link>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 md:w-3/4 md:pr-10">
            {/* Column 1 */}
            <div>
              <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-extrabold text-zinc-200 uppercase tracking-wider text-nowrap font-heading">
                Get to Know Us
              </h2>
              <ul className="text-zinc-400 space-y-3 md:space-y-4 font-medium font-sans">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                  >
                    About Humor Hub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                  >
                    Contact Our Team
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-extrabold text-zinc-200 uppercase tracking-wider text-nowrap font-heading">
                Stay Connected
              </h2>
              <ul className="text-zinc-400 space-y-3 md:space-y-4 font-medium font-sans">
                <li>
                  <a
                    href="https://twitter.com/naterbug321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/nate_wrigh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/nate_wright3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/njwright92"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-extrabold text-zinc-200 uppercase tracking-wider text-nowrap font-heading">
                Legal Info
              </h2>
              <div className="text-zinc-400 flex flex-col space-y-3 md:space-y-4 font-medium font-sans">
                <Link
                  href="/userAgreement"
                  className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                >
                  User Agreement
                </Link>
                <Link
                  href="/privacyPolicy"
                  className="hover:text-amber-300 hover:underline transition-colors md:text-lg"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row-reverse items-center justify-between w-full gap-4 sm:gap-0 border-t border-zinc-800/50">
          <div className="flex items-center gap-4">
            <ScrollToTop />
          </div>

          <span className="text-xs md:text-sm text-zinc-400 font-mono text-left">
            © {new Date().getFullYear()} Humor Hub™. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
