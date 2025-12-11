import Image from "next/image";
import Link from "next/link";
import hh from "../../app/hh.webp";
import Nav from "./nav";

export default function Header() {
  return (
    <>
      {/* Mobile Header Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-amber-300 p-2 sm:hidden">
        <Link href="/" aria-label="Humor Hub Home">
          <Image
            src={hh}
            alt=""
            width={50}
            height={50}
            className="rounded-full border-2 border-zinc-900 shadow-lg"
            priority
          />
        </Link>

        <h1 className="font-heading text-5xl font-extrabold tracking-wide text-zinc-950">
          Humor Hub!
        </h1>

        <Nav isMobile />
      </header>

      {/* Desktop Sidebar */}
      <Nav isDesktop />
    </>
  );
}
