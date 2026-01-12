import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const MobileNav = dynamic(() => import("./MobileNav"));
const DesktopNav = dynamic(() => import("./DesktopNav"));

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 grid h-20 grid-cols-[auto_1fr_auto] items-center bg-amber-700 p-2 sm:hidden">
        <Link href="/" aria-label="Humor Hub Home">
          <Image
            src="/logo.webp"
            alt=""
            width={60}
            height={60}
            className="rounded-full shadow-xl hover:scale-110 hover:rotate-3"
            priority
            quality={70}
          />
        </Link>
        <h1 className="text-center text-4xl whitespace-nowrap text-stone-900">
          Humor Hub!
        </h1>
        <MobileNav />
      </header>
      <DesktopNav />
    </>
  );
}
