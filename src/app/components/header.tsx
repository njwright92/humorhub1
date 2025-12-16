import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import hh from "../../app/hh.webp";

const DesktopNav = dynamic(() => import("./DesktopNav"));
const MobileNav = dynamic(() => import("./MobileNav"));

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-amber-700 p-2 sm:hidden">
        <Link
          href="/"
          aria-label="Humor Hub Home"
          className="relative z-10 shrink-0"
        >
          <Image
            src={hh}
            alt="Humor Hub Logo"
            width={50}
            height={50}
            className="rounded-full border-2 border-stone-900 shadow-lg"
            priority
          />
        </Link>

        <h1 className="font-heading absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold tracking-wide whitespace-nowrap text-stone-900">
          Humor Hub!
        </h1>

        <div className="relative z-10 shrink-0">
          <MobileNav />
        </div>
      </header>

      <div className="hidden sm:block">
        <DesktopNav />
      </div>
    </>
  );
}
