"use client";

import { useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "./SessionContext";
import { useProtectedNavigation } from "./useProtectedNavigation";
import SearchBar from "./searchBar";

type NavItem = {
  href?: string;
  label: string;
  icon: string;
  protected?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/mic-finder",
    label: "Mic Finder",
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z|circle:12,10,3",
  },
  {
    label: "News",
    icon: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9h4|M10 6h8M10 10h8M10 14h4",
    protected: "/News",
  },
  {
    label: "Profile",
    icon: "M20 21a8 8 0 0 0-16 0|circle:12,8,4",
    protected: "/Profile",
  },
  {
    href: "/contact",
    label: "Contact Us",
    icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z|m22 6-10 7L2 6",
  },
  {
    href: "/about",
    label: "About",
    icon: "circle:12,12,10|M12 16v-4M12 8h.01",
  },
];

const SIGN_IN_ICON =
  "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4|M10 17l5-5-5-5|M15 12H3";

const NavIcon = memo(function NavIcon({ icon }: { icon: string }) {
  const parts = icon.split("|");
  return (
    <svg
      className="size-10 transition-colors hover:text-stone-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {parts.map((part, i) => {
        if (part.startsWith("circle:")) {
          const [cx, cy, r] = part.slice(7).split(",");
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        return <path key={i} d={part} />;
      })}
    </svg>
  );
});

export default function DesktopNav() {
  const { session, refreshSession } = useSession();
  const { requireAuth, preloadAuthModal } = useProtectedNavigation();

  const ensureAuthListener = useCallback(() => {
    preloadAuthModal();
    if (session.status === "unknown") {
      void refreshSession();
    }
  }, [preloadAuthModal, refreshSession, session.status]);

  const isUserSignedIn =
    session.status === "ready" && session.signedIn === true;

  return (
    <nav className="fixed inset-y-0 left-0 z-50 hidden w-20 flex-col items-center bg-amber-700 p-2 pt-6 shadow-lg sm:flex">
      <div className="grid w-full justify-items-center gap-6 text-stone-900">
        <Link href="/" aria-label="Home" className="nav-item">
          <Image
            src="/logo.webp"
            alt=""
            width={80}
            height={80}
            className="my-2 rounded-full shadow-xl"
            priority
            sizes="(min-width: 768px) 168px, 128px"
            quality={70}
          />
        </Link>

        <SearchBar
          isUserSignedIn={session.signedIn}
          sessionStatus={session.status}
          onRequireAuth={requireAuth}
        />

        {NAV_ITEMS.map(({ href, label, icon, protected: protectedPath }) => {
          const content = (
            <>
              <NavIcon icon={icon} />
              <span className="nav-tooltip">{label}</span>
            </>
          );

          return protectedPath ? (
            <button
              key={label}
              type="button"
              onMouseEnter={ensureAuthListener}
              onFocus={ensureAuthListener}
              onClick={() => void requireAuth(protectedPath, label)}
              aria-label={label}
              className="nav-item"
            >
              {content}
            </button>
          ) : (
            <Link
              key={label}
              href={href!}
              aria-label={label}
              className="nav-item"
            >
              {content}
            </Link>
          );
        })}
      </div>
      {!isUserSignedIn && (
        <div className="mt-16 text-zinc-200">
          <button
            type="button"
            onMouseEnter={ensureAuthListener}
            onFocus={ensureAuthListener}
            onClick={() => void requireAuth("/Profile", "Sign In")}
            aria-label="Sign In / Sign Up"
            className="nav-item group relative"
          >
            <NavIcon icon={SIGN_IN_ICON} />
            <span className="nav-tooltip">Sign In / Sign Up</span>
          </button>
        </div>
      )}
    </nav>
  );
}
