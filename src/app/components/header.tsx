import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import hh from "../../app/hh.webp";

const DesktopNav = dynamic(() => import("./DesktopNav"));
const MobileNav = dynamic(() => import("./MobileNav"));

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-amber-700 p-1 sm:hidden">
        <Link href="/" aria-label="Humor Hub Home">
          <Image
            src={hh}
            alt="Humor Hub Logo"
            width={50}
            height={50}
            className="rounded-full border-2 border-stone-900 shadow-lg"
            priority
          />
        </Link>

        <h1 className="font-heading text-5xl font-bold tracking-wide whitespace-nowrap text-stone-900">
          Humor Hub!
        </h1>
        <div className="relative z-10">
          <MobileNav />
        </div>
      </header>
      <div className="hidden sm:block">
        <DesktopNav />
      </div>
    </>
  );
}
