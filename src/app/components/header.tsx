import dynamic from "next/dynamic";

const MobileNav = dynamic(() => import("./MobileNav"));
const DesktopNav = dynamic(() => import("./DesktopNav"));

export default function Header() {
  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  );
}
