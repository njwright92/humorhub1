import Image from "next/image";
import Link from "next/link";
import hh from "../../app/hh.webp";
import Nav from "./nav";

export default function Header() {
  return (
    <>
      {/* Mobile Header Bar */}
      <header className="sm:hidden p-2 sticky top-0 z-50 bg-amber-300 flex justify-between items-center">
        <Link href="/" aria-label="Home">
          <Image
            src={hh}
            alt="Humor Hub Logo"
            width={50}
            height={50}
            className="rounded-full border-2 border-zinc-900 shadow-lg"
            priority
          />
        </Link>

        <h1 className="text-zinc-950 font-heading text-5xl font-extrabold tracking-wide">
          Humor Hub!
        </h1>

        <Nav isMobile />
      </header>

      {/* Desktop Sidebar */}
      <Nav isDesktop />
    </>
  );
}
