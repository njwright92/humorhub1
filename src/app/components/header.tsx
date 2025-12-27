import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import hh from "../../app/logo.webp";

const MobileNav = dynamic(() => import("./MobileNav"));
const DesktopNav = dynamic(() => import("./DesktopNav"));

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-18 items-center justify-between bg-amber-700 p-2 sm:hidden">
        <Link href="/" aria-label="Humor Hub Home">
          <Image
            src={hh}
            alt=""
            width={60}
            height={60}
            className="rounded-full shadow-lg group-hover:scale-110 group-hover:rotate-3"
            priority
          />
        </Link>
        <h1 className="font-heading text-4xl font-bold tracking-wide whitespace-nowrap text-stone-900">
          Humor Hub!
        </h1>
        <MobileNav />
      </header>
      <DesktopNav />
    </>
  );
}
